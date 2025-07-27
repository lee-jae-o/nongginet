import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    VStack,
    useToast,
    Text,
    Center,
    Heading,
    Icon,
    HStack,
} from '@chakra-ui/react';
import { FaQuestionCircle } from 'react-icons/fa'; // 비밀번호 찾기 아이콘 추가

export default function FindPasswordPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    const handleFindPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // 로딩 시작

        try {
            const response = await fetch('/api/user/find-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '사용자 정보를 찾을 수 없습니다. 아이디와 이메일을 다시 확인해주세요.');
            }

            toast({
                title: '사용자 확인 완료',
                description: '비밀번호 재설정 페이지로 이동합니다.',
                status: 'success',
                duration: 2000,
                isClosable: true,
                position: 'top',
            });
            
            // 1초 후 비밀번호 재설정 페이지로 이동
            setTimeout(() => {
                navigate('/reset-password', { state: { username } });
            }, 1000);

        } catch (err) {
            setError(err.message);
            toast({
                title: '비밀번호 찾기 실패',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    return (
        <Center minH="100vh" bg="gray.100">
            <Box
                maxW="md"
                mx="auto"
                p={8}
                bg="white"
                boxShadow="xl"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="gray.200"
            >
                <VStack spacing={6} align="stretch">
                    <HStack justifyContent="center" spacing={3}>
                        <Icon as={FaQuestionCircle} w={10} h={10} color="teal.500" />
                        <Heading as="h1" size="xl" textAlign="center" color="teal.700">
                            비밀번호 찾기
                        </Heading>
                    </HStack>

                    <form onSubmit={handleFindPassword}>
                        <VStack spacing={4}>
                            <FormControl id="username">
                                <FormLabel fontSize="md" fontWeight="medium">아이디</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    variant="filled"
                                    size="lg"
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
                                    variant="filled"
                                    size="lg"
                                />
                            </FormControl>

                            {error && (
                                <Text color="red.500" fontSize="sm" textAlign="center">
                                    {error}
                                </Text>
                            )}
                            
                            <Button
                                colorScheme="teal"
                                type="submit"
                                width="100%"
                                size="lg"
                                isLoading={isLoading}
                                loadingText="확인 중..."
                                mt={4}
                                boxShadow="md"
                                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            >
                                비밀번호 찾기
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
                        <Link to="/find-id">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                아이디 찾기
                            </Button>
                        </Link>
                    </HStack>
                </VStack>
            </Box>
        </Center>
    );
}