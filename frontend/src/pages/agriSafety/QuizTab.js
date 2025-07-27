import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  RadioGroup,
  Radio,
  useToast,
  Heading,
  Divider,
  Spinner,
  HStack,
  Center,
  Alert, AlertIcon, // Alert 추가
} from '@chakra-ui/react';
import axios from 'axios';

const QuizTab = () => {
  const [quizData, setQuizData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 에러 상태 추가

  const loadQuiz = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/quiz')
      .then(res => {
        const shuffled = res.data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5); // 항상 5문제만
        setQuizData(selected);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
        setLoading(false);
      })
      .catch(() => {
        setError("서버에서 퀴즈 데이터를 불러올 수 없습니다. 다시 시도해 주세요.");
        toast({
          title: "퀴즈 데이터 오류",
          description: "서버에서 퀴즈 데이터를 불러올 수 없습니다.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  const handleAnswerChange = (questionIndex, choice) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: choice
    }));
  };

  const handleSubmit = () => {
    // 모든 문제에 답했는지 확인
    if (Object.keys(selectedAnswers).length < quizData.length) {
      toast({
        title: "선택 부족",
        description: "모든 문제에 답해주세요!",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    let total = 0;
    quizData.forEach((quiz, index) => {
      if (selectedAnswers[index] === quiz.answer) {
        total += 1;
      }
    });
    setScore(total);
    setShowResults(true);
  };

  if (loading) return (
    <Center py={10}>
      <Spinner size="xl" color="teal.500" thickness="4px" />
    </Center>
  );

  if (error) return (
    <Alert status="error" borderRadius="md">
      <AlertIcon />
      {error}
    </Alert>
  );

  return (
    <Box p={5} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="lg" mb={2} color="teal.700" textAlign="center">농기계 안전 퀴즈</Heading>
      <Text mb={6} fontSize="md" color="gray.600" textAlign="center">
        총 {quizData.length}문제가 출제됩니다. 선택 후 정답을 확인해보세요!
      </Text>
      <Divider mb={6} borderColor="gray.300" />

      <VStack spacing={6} align="stretch">
        {quizData.map((quiz, index) => (
          <Box
            key={index}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            bg={showResults ? (selectedAnswers[index] === quiz.answer ? 'green.50' : 'red.50') : 'gray.50'}
            borderColor={showResults ? (selectedAnswers[index] === quiz.answer ? 'green.200' : 'red.200') : 'gray.200'}
            boxShadow="sm"
            transition="all 0.2s"
          >
            <Text fontWeight="bold" fontSize="lg" mb={3} color="gray.800">
              Q{index + 1}. {quiz.question}
            </Text>
            <RadioGroup
              onChange={(val) => handleAnswerChange(index, val)}
              value={selectedAnswers[index] || ''}
              isDisabled={showResults}
              colorScheme="teal"
            >
              <VStack align="start" spacing={3}>
                {quiz.choices.map((choice, i) => (
                  <Radio
                    key={i}
                    value={choice}
                    size="lg"
                    _hover={{ bg: !showResults ? 'teal.50' : 'inherit' }}
                    px={2} py={1} borderRadius="md"
                    width="100%"
                  >
                    {choice}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>

            {showResults && (
              <Box mt={4} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                <Text color="green.600" fontWeight="bold" fontSize="md">✅ 정답: {quiz.answer}</Text>
                {selectedAnswers[index] !== quiz.answer && (
                  <Text color="red.600" fontWeight="bold" fontSize="md">❌ 내 선택: {selectedAnswers[index] || '선택 안 함'}</Text>
                )}
                <Text fontSize="sm" color="gray.700" mt={2} whiteSpace="pre-line">해설: {quiz.explanation}</Text>
              </Box>
            )}
          </Box>
        ))}
      </VStack>

      <HStack spacing={4} mt={8} justify="center">
        {!showResults ? (
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            size="lg"
            minW="150px"
            borderRadius="lg"
            _hover={{ bg: "teal.600", transform: "translateY(-1px)" }}
          >
            정답 확인
          </Button>
        ) : (
          <>
            <Text fontWeight="extrabold" fontSize="2xl" color="blue.600">
              🎉 당신의 점수는 {score}점 / {quizData.length}점 입니다!
            </Text>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={loadQuiz}
              size="lg"
              minW="150px"
              borderRadius="lg"
              _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
            >
              다시 풀기
            </Button>
          </>
        )}
      </HStack>
    </Box>
  );
};

export default QuizTab;