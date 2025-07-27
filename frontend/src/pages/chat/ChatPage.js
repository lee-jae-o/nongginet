import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Input, VStack, Text, Spinner,
  IconButton, useToast, HStack, Tag, Spacer, Alert, AlertIcon
} from '@chakra-ui/react';
import { DeleteIcon, ChatIcon } from '@chakra-ui/icons';

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || "Anonymous";
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`/api/chat/sessions/${username}`);
        if (res.ok) {
          const data = await res.json();
          const uniqueSessions = Array.from(new Set(data.sessions.map(s => s.session_id)))
            .map(id => data.sessions.find(s => s.session_id === id));
          setSessions(uniqueSessions);

          const lastSessionId = localStorage.getItem('last_selected_session');
          const foundSession = uniqueSessions.find(s => s.session_id === lastSessionId);

          if (foundSession) {
            await handleSessionClick(foundSession.session_id);
          } else if (uniqueSessions.length > 0) {
            await handleSessionClick(uniqueSessions[0].session_id);
          } else {
            await handleNewChat();
          }
        }
      } catch (error) {
        console.error("세션 불러오기 에러:", error);
        toast({
          title: "오류",
          description: "대화 목록을 불러오는데 실패했습니다.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchSessions();
  }, [username]);

  const handleNewChat = async () => {
    const newSessionId = uuidv4();
    const newSession = {
      session_id: newSessionId,
      username,
      messages: []
    };

    try {
      await fetch('/api/chat/new-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      const res = await fetch(`/api/chat/sessions/${username}`);
      const data = await res.json();
      const uniqueSessions = Array.from(new Set(data.sessions.map(s => s.session_id)))
        .map(id => data.sessions.find(s => s.session_id === id));

      setSessions(uniqueSessions);
      await handleSessionClick(newSessionId);
      localStorage.setItem('last_selected_session', newSessionId);
    } catch (error) {
      console.error("새 세션 생성 실패:", error);
      toast({
        title: "오류",
        description: "새 대화를 생성하는데 실패했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSessionClick = async (sessionId) => {
    try {
      const res = await fetch(`/api/chat/session-messages/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession({ session_id: sessionId, messages: data.messages });
        localStorage.setItem('last_selected_session', sessionId);
      } else {
        throw new Error("세션 메시지를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("메시지 불러오기 에러:", error);
      toast({
        title: "오류",
        description: "대화 내용을 불러오는데 실패했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  // 통합 검색 함수
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageToSend = input;
    setInput('');
    setLoading(true);

    const newMessage = { role: 'user', content: messageToSend };
    const sessionId = selectedSession.session_id;

    // 사용자 메시지를 즉시 화면에 표시
    setSelectedSession((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    try {
      // ✅ 이제는 임대 API만 호출
      const rentalRes = await fetch('/api/rag/agri-rental/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageToSend,
          session_id: sessionId,
          username
        })
      });

      let finalBestResponse = "죄송합니다. 관련 정보를 찾을 수 없습니다.";
      let finalResponseSource = "";

      const rentalData = rentalRes.ok ? await rentalRes.json() : null;
      const rentalResponseContent = rentalData ? rentalData.response : null;

      const isNotFound = (responseContent) => {
        if (!responseContent) return true;
        const lowerContent = responseContent.toLowerCase();
        return lowerContent.includes("관련 정보를 찾을 수 없습니다") ||
              lowerContent.includes("정보를 찾을 수 없습니다") ||
              lowerContent.includes("알려드릴 수 없습니다");
      };

      if (rentalResponseContent && !isNotFound(rentalResponseContent)) {
        finalBestResponse = rentalResponseContent;
        finalResponseSource = "농기계임대 사업시행지침";
      } else {
        finalBestResponse = "죄송합니다. 현재 질문에 대한 정확한 정보를 찾을 수 없습니다. 질문을 바꿔서 다시 시도해주시거나, 다른 종류의 질문을 해주세요.";
      }

      const botResponseContent = finalBestResponse;
      const botMessage = { role: 'bot', content: botResponseContent };
      const updatedMessages = [...selectedSession.messages, newMessage, botMessage];

      await fetch('/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, messages: updatedMessages })
      });

      setSelectedSession((prev) => ({
        ...prev,
        messages: updatedMessages
      }));
    } catch (error) {
      console.error("메시지 전송 오류:", error.message);
      toast({
        title: "메시지 전송 실패",
        description: "다시 시도해주세요.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setSelectedSession((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1) // 사용자 메시지 제거
      }));
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (sessionId) => {
    if (!window.confirm("정말로 이 대화 내용을 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/chat/delete/${sessionId}`, { method: 'DELETE' });
      const remainingSessions = sessions.filter(s => s.session_id !== sessionId);
      setSessions(remainingSessions);

      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null);
        localStorage.removeItem('last_selected_session');
        if (remainingSessions.length > 0) {
          await handleSessionClick(remainingSessions[0].session_id);
        } else {
          await handleNewChat();
        }
      }
      toast({
        title: "삭제 완료",
        description: "대화가 성공적으로 삭제되었습니다.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("세션 삭제 오류:", error);
      toast({
        title: "삭제 실패",
        description: "세션 삭제에 실패했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateSidebarTitle = (session) => {
    if (session.first_message) {
      return session.first_message.slice(0, 20) + (session.first_message.length > 20 ? '...' : '');
    }
    return "새로운 대화";
  };

  const exampleQuestions = [
    "농기계 빌리려면 어디로 가야 돼?",
    "농기계는 며칠 동안 빌릴 수 있어?",
    "농기계 잘 못 다뤄도 빌릴 수 있어?",
    "어떤 사람들이 농기계 우선 임대받을 수 있어?",
    
    "농기계 빌리려면 어떤 조건이 필요해?",
    "농기계 처음 빌리는 사람도 임대할 수 있어?",
    "지역마다 임대료가 달라?",
    "농기계를 빌렸는데 부득이한 이유로 사용하지 못한 경우 어떻게 돼?"
  ];

  return (
    <Flex height="100vh" overflow="hidden" bg="gray.50">
      {/* Sidebar */}
      <Box
        w={{ base: "250px", md: "300px" }}
        bg="white"
        p={4}
        borderRight="1px solid"
        borderColor="gray.200"
        overflowY="auto"
        boxShadow="md"
      >
        <Heading size="lg" mb={6} color="teal.600">
          <HStack spacing={2} alignItems="center">
            <ChatIcon />
            <Text>농기계 챗봇</Text>
          </HStack>
        </Heading>
        <Button
          colorScheme="teal"
          onClick={handleNewChat}
          mb={6}
          w="100%"
          size="lg"
          leftIcon={<ChatIcon />}
          _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
          _active={{ bg: "teal.700" }}
        >
          새로운 대화 시작
        </Button>
        <VStack align="stretch" spacing={3}>
          {sessions.length === 0 && !loading && (
            <Text color="gray.500" textAlign="center" py={4}>
              시작된 대화가 없습니다.
            </Text>
          )}
          {sessions.map((s) => (
            <Flex
              key={s.session_id}
              justify="space-between"
              align="center"
              bg={selectedSession?.session_id === s.session_id ? 'teal.50' : 'gray.50'}
              color={selectedSession?.session_id === s.session_id ? 'teal.800' : 'gray.700'}
              p={3}
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: selectedSession?.session_id === s.session_id ? 'teal.100' : 'gray.100' }}
              transition="background-color 0.2s"
            >
              <Text onClick={() => handleSessionClick(s.session_id)} flex="1" noOfLines={1} fontWeight="medium">
                {updateSidebarTitle(s)}
              </Text>
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                aria-label="Delete session"
                onClick={(e) => { e.stopPropagation(); handleDelete(s.session_id); }}
                variant="ghost"
                colorScheme="red"
                ml={2}
              />
            </Flex>
          ))}
        </VStack>
        <Spacer />
        <Button
          mt={8}
          colorScheme="gray"
          variant="ghost"
          onClick={() => navigate('/')}
          w="100%"
          leftIcon={<span>🏠</span>}
          _hover={{ bg: "gray.100" }}
        >
          홈으로
        </Button>
      </Box>

      {/* Chat Panel */}
      <Flex flex="1" direction="column" p={6} bg="white" borderRadius="xl" m={4} boxShadow="xl">
        {/* 강화된 안내 박스 */}
        <Alert status="info" mb={6} borderRadius="lg" bg="teal.50" borderColor="teal.200" border="1px solid">
          <AlertIcon color="teal.500" />
          <Box flex="1">
            <Heading size="md" mb={2} color="teal.700">🤖 농기계 전문 상담 챗봇</Heading>
            <Text fontSize="md" mb={3} color="gray.700" fontWeight="medium">
              이 챗봇은 <strong>'2025년 농기계임대 사업시행지침'</strong>을 기반으로
              농기계 임대 조건, 신청 방법, 임대료, 사고 시 책임 및 환불 등 
              임대사업 관련 정보를 종합적으로 안내합니다.
            </Text>
            <Text fontSize="sm" mb={3} fontWeight="bold" color="teal.600">💡 다음과 같은 질문을 해보세요:</Text>
            <HStack spacing={2} wrap="wrap">
              {exampleQuestions.slice(0, 4).map((q, i) => (
                <Tag
                  key={i}
                  cursor="pointer"
                  onClick={() => setInput(q)}
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  px={2}
                  py={1}
                  borderRadius="full"
                  _hover={{ bg: "teal.50", borderColor: "teal.400" }}
                  transition="all 0.2s"
                >
                  {q}
                </Tag>
              ))}
            </HStack>
            <HStack spacing={2} wrap="wrap" mt={2}>
              {exampleQuestions.slice(4).map((q, i) => (
                <Tag
                  key={i + 4}
                  cursor="pointer"
                  onClick={() => setInput(q)}
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  px={2}
                  py={1}
                  borderRadius="full"
                  _hover={{ bg: "teal.50", borderColor: "teal.400" }}
                  transition="all 0.2s"
                >
                  {q}
                </Tag>
              ))}
            </HStack>
          </Box>
        </Alert>

        {/* 메시지 출력 */}
        <Box flex="1" overflowY="auto" mb={6} p={4} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.200">
          {selectedSession?.messages.length === 0 && !loading && (
            <Flex direction="column" align="center" justify="center" height="100%">
              <Text fontSize="lg" color="gray.500">
                농기계 관련 질문을 입력하여 대화를 시작해보세요!
              </Text>
              <Text fontSize="sm" color="gray.400" mt={2}>
                위의 예시 질문을 클릭하셔도 좋습니다.
              </Text>
            </Flex>
          )}
          {selectedSession?.messages.map((msg, idx) => (
            <Flex key={idx} mb={4} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
              <Box
                bg={msg.role === 'user' ? 'teal.400' : 'gray.200'}
                color={msg.role === 'user' ? 'white' : 'gray.800'}
                px={4}
                py={2.5}
                borderRadius="xl"
                maxW="70%"
                wordBreak="break-word"
                boxShadow="sm"
                whiteSpace="pre-line"
              >
                <Text>{msg.content}</Text>
              </Box>
            </Flex>
          ))}
          {loading && (
            <Flex justify="flex-start" mb={4}>
              <HStack>
                <Spinner size="md" color="teal.500" />
                <Text color="gray.500" fontSize="sm">두 문서에서 최적의 답변을 찾고 있습니다...</Text>
              </HStack>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* 입력창 */}
        <Flex gap={3}>
          <Input
            placeholder="농기계 정책이나 임대사업에 대해 질문하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            isDisabled={loading}
            size="lg"
            borderRadius="lg"
            borderColor="gray.300"
            _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
          />
          <Button
            onClick={handleSend}
            isLoading={loading}
            colorScheme="teal"
            size="lg"
            borderRadius="lg"
            px={8}
            _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
            _active={{ bg: "teal.700" }}
          >
            전송
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}