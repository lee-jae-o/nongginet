import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link 추가
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    VStack,
    useToast,
    Text,
    Center, // Center 컴포넌트 추가
    Heading, // Heading 컴포넌트 추가
    Icon, // Icon 컴포넌트 추가
    HStack, // HStack 추가
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'; // 검색 관련 아이콘 추가 (React Icons)

export default function FindIdPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    const handleFindId = async (e) => {
        e.preventDefault();
        setError('');
        setResult('');
        setIsLoading(true); // 로딩 시작

        try {
            const response = await fetch('/api/user/find-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!response.ok) {
                const errorData = await response.json(); // 서버에서 보낸 에러 메시지를 파싱
                throw new Error(errorData.detail || '아이디 찾기 실패'); // detail 필드가 없으면 기본 메시지 사용
            }

            const data = await response.json();
            setResult(`당신의 아이디는 "${data.username}" 입니다.`); // 아이디를 강조해서 보여주기
            toast({
                title: '아이디를 찾았습니다!',
                description: `아이디: ${data.username}`,
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
        } catch (err) {
            setError(err.message);
            toast({
                title: '아이디 찾기 실패',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    return (
        <Center minH="100vh" bg="gray.100"> {/* 배경색 및 중앙 정렬 */}
            <Box
                maxW="md" // Box의 최대 너비
                mx="auto"
                p={8}
                bg="white"
                boxShadow="xl" // 그림자 강화
                borderRadius="lg" // 모서리 둥글게
                borderWidth="1px" // 테두리 추가
                borderColor="gray.200"
            >
                <VStack spacing={6} align="stretch">
                    <HStack justifyContent="center" spacing={3}>
                        <Icon as={FaSearch} w={10} h={10} color="teal.500" /> {/* 아이콘 추가 */}
                        <Heading as="h1" size="xl" textAlign="center" color="teal.700">
                            아이디 찾기
                        </Heading>
                    </HStack>

                    <form onSubmit={handleFindId}>
                        <VStack spacing={4}>
                            <FormControl id="name">
                                <FormLabel fontSize="md" fontWeight="medium">이름</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="가입 시 입력한 이름을 입력하세요"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    variant="filled" // 입력 필드 배경색 추가
                                    size="lg" // 입력 필드 크기 증가
                                />
                            </FormControl>

                            <FormControl id="email">
                                <FormLabel fontSize="md" fontWeight="medium">이메일</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="가입 시 입력한 이메일을 입력하세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    variant="filled" // 입력 필드 배경색 추가
                                    size="lg" // 입력 필드 크기 증가
                                />
                            </FormControl>

                            {error && (
                                <Text color="red.500" fontSize="sm" textAlign="center">
                                    {error}
                                </Text>
                            )}
                            {result && (
                                <Text color="green.600" fontSize="md" fontWeight="bold" textAlign="center">
                                    {result}
                                </Text>
                            )}

                            <Button
                                colorScheme="teal" // 버튼 색상 변경
                                type="submit"
                                width="100%"
                                size="lg" // 버튼 크기 증가
                                isLoading={isLoading} // 로딩 상태 반영
                                loadingText="찾는 중..."
                                mt={4} // 상단 여백 추가
                                boxShadow="md" // 버튼에도 그림자 추가
                                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            >
                                아이디 찾기
                            </Button>
                        </VStack>
                    </form>
                    <HStack justify="center" spacing={4} pt={2}>
                        <Link to="/login">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                로그인 페이지로
                            </Button>
                        </Link>
                        <Text color="gray.400">|</Text>
                        <Link to="/register">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                회원가입
                            </Button>
                        </Link>
                    </HStack>
                </VStack>
            </Box>
        </Center>
    );
}