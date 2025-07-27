import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  Heading,
  Spinner,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ScaleFade,
  Image,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import he from "he";
import { SearchIcon, InfoOutlineIcon } from "@chakra-ui/icons"; // 아이콘 추가


const NO_RESULTS_IMAGE = "https://via.placeholder.com/400x200?text=No+Matching+Term";
const INITIAL_PROMPT_IMAGE = "https://via.placeholder.com/400x200?text=Start+Searching"; 

const TermsPage = () => {
  const [word, setWord] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // 검색 수행 여부 추적

  const handleSearch = async () => {
    setError(null); // 새로운 검색 시작 시 에러 초기화
    setHasSearched(true); // 검색 버튼 클릭 시 검색 수행 상태로 변경

    if (!word.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setResults([]); // 검색 시작 전 기존 결과 초기화

    try {
      const res = await axios.get(`/api/terms/search`, {
        params: { word },
      });
      if (res.data && Array.isArray(res.data.results)) { // results가 배열인지 확인
        setResults(res.data.results);
      } else {
        setResults([]);
        // 서버 응답 형식이 예상과 다를 경우의 처리
        console.warn("API 응답 형식이 예상과 다릅니다:", res.data);
      }
    } catch (error) {
      console.error("검색 오류:", error);
      setError("용어 검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setResults([]); // 오류 발생 시 결과 초기화
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (wordNo) => {
    setSelectedTerm(null); // 이전 상세 정보 초기화
    setError(null); // 상세 정보 로드 전 에러 초기화
    onOpen(); // 모달을 먼저 열고, 내용 로딩 중 스피너 표시 (선택 사항)

    try {
      const res = await axios.get(`/api/terms/detail`, {
        params: { wordNo },
      });
      if (res.data && res.data.detail) {
        setSelectedTerm(res.data.detail);
      } else {
        setSelectedTerm(null);
        setError("선택된 용어에 대한 상세 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("상세 정보 불러오기 오류:", error);
      setError("상세 정보를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
      setSelectedTerm(null);
    }
    // 상세 정보 로딩 스피너가 있다면 여기서 멈춤
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      maxW="700px"
      mx="auto"
      bgGradient="linear(to-br, teal.50, blue.50)" // 부드러운 그라데이션 배경
      minH="calc(100vh - 120px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      boxShadow="2xl" // 그림자 더 강하게
      borderRadius="2xl" // 모서리 더 둥글게
      py={10}
      my={8}
      border="1px solid" // 테두리 추가
      borderColor="teal.100" // 테두리 색상
    >
      <Heading mb={8} fontSize={{ base: "2xl", md: "3xl" }} textAlign="center" color="teal.700" textShadow="1px 1px 3px rgba(0,0,0,0.15)">
        🌿 농업 용어 사전
      </Heading>

      <HStack mb={6} width="100%" maxW="500px">
        <Input
          placeholder="궁금한 농업 용어를 검색해보세요 (예: 벼, 트랙터)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          size="lg"
          focusBorderColor="teal.500" // 포커스 색상 더 진하게
          borderRadius="xl" // 모서리 더 둥글게
          boxShadow="md"
          _placeholder={{ color: "gray.400" }}
          bg="white" // 입력창 배경 흰색
        />
        <Button
          onClick={handleSearch}
          colorScheme="teal"
          size="lg"
          px={8}
          borderRadius="xl" // 모서리 더 둥글게
          boxShadow="md"
          _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          _active={{ transform: "translateY(0)", boxShadow: "sm" }} // 클릭 시 효과
          transition="all 0.2s"
          leftIcon={<SearchIcon />} // 검색 아이콘 추가
        >
          검색
        </Button>
      </HStack>

      {error && (
        <Alert status="error" borderRadius="md" mb={4} maxW="500px" width="100%">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading ? (
        <Center py={10} flexDirection="column" spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600" mt={3}>용어를 검색 중입니다. 잠시만 기다려 주세요...</Text>
        </Center>
      ) : (
        <VStack spacing={4} align="stretch" width="100%" maxW="500px" mt={4}>
          {hasSearched && results.length === 0 ? ( // 검색을 했고 결과가 없을 때
            <VStack spacing={4} py={10} textAlign="center">
              <Image src={NO_RESULTS_IMAGE} alt="No results found" boxSize="200px" objectFit="contain" opacity={0.7} />
              <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                '{word}'에 대한 검색 결과가 없습니다.
              </Text>
              <Text fontSize="md" color="gray.500">
                다른 용어로 검색해 보시거나, 오탈자가 없는지 확인해 주세요.
              </Text>
            </VStack>
          ) : results.length > 0 ? ( // 검색 결과가 있을 때
            <ScaleFade initialScale={0.9} in={true}>
              {results.map((item) => (
                <Box
                  key={item.wordNo}
                  borderWidth={1}
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={5}
                  cursor="pointer"
                  onClick={() => handleCardClick(item.wordNo)}
                  _hover={{ bg: "teal.50", borderColor: "teal.200", transform: "translateY(-3px)", boxShadow: "lg" }}
                  _active={{ transform: "translateY(0)", boxShadow: "sm", bg: "teal.100" }} // 클릭 시 효과
                  transition="all 0.2s ease-in-out"
                  boxShadow="md"
                  bg="white"
                >
                  <Text fontWeight="extrabold" fontSize="xl" color="teal.800">
                    {item.wordNm}
                  </Text>
                  {item.wordDc && (
                    <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                      {he.decode(item.wordDc).replace(/<[^>]+>/g, "")}
                    </Text>
                  )}
                </Box>
              ))}
            </ScaleFade>
          ) : ( // 초기 상태 (아직 검색하지 않았을 때)
            <VStack spacing={4} py={10} textAlign="center">
              <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                🌱 농업 용어를 쉽게 찾아보세요!
              </Text>
              <Text fontSize="md" color="gray.500">
                궁금한 용어를 검색창에 입력하고 엔터를 누르거나 '검색' 버튼을 클릭해 보세요.
              </Text>
            </VStack>
          )}
        </VStack>
      )}

      {/* ✅ 상세 정보 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom" isCentered>
        <ModalOverlay bg="blackAlpha.200" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl" boxShadow="2xl" p={4}>
          <ModalHeader fontSize="2xl" fontWeight="bold" color="teal.600" pb={2}>
            용어 상세 정보
          </ModalHeader>
          <ModalCloseButton _hover={{ color: "teal.500" }} />
          <ModalBody pt={0}> {/* 패딩 조정 */}
            {selectedTerm ? (
              <VStack align="flex-start" spacing={3}>
                <Text fontSize="xl" fontWeight="bold" color="teal.800">
                  <InfoOutlineIcon mr={2} color="teal.500" />단어: {selectedTerm.wordNm}
                </Text>
                {selectedTerm.wordDc ? (
                  <Box
                    p={4} // 패딩 증가
                    bg="teal.50"
                    borderRadius="lg" // 모서리 더 둥글게
                    borderLeft="5px solid" // 테두리 두께 증가
                    borderColor="teal.400" // 테두리 색상 진하게
                    width="100%"
                    boxShadow="inner" // 내부 그림자
                  >
                    <Text fontSize="md" color="gray.700" lineHeight="tall" dangerouslySetInnerHTML={{ __html: he.decode(selectedTerm.wordDc) }} />
                  </Box>
                ) : (
                  <Text mt={2} color="gray.500" fontStyle="italic" p={4} bg="gray.50" borderRadius="md" width="100%">
                    이 용어에 대한 상세한 설명이 없습니다.
                  </Text>
                )}
              </VStack>
            ) : (
              <VStack spacing={3} textAlign="center" py={5}>
                 <Spinner size="md" color="teal.500" /> {/* 모달 로딩 스피너 */}
                 <Text color="gray.500" fontSize="lg">
                   상세 정보를 불러오는 중이거나 찾을 수 없습니다.
                 </Text>
                 <Text color="gray.400" fontSize="sm">
                   잠시 후 다시 시도해 주세요.
                 </Text>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TermsPage;