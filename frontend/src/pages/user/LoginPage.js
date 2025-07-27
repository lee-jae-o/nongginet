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
    HStack,
    Center, // Center 컴포넌트 추가
    Heading, // Heading 컴포넌트 추가
    Icon, // Icon 컴포넌트 추가 (react-icons 사용 시 필요)
} from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa'; // 로그인 관련 아이콘 추가 예시

export default function LoginPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // 로딩 시작

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                throw new Error('아이디 또는 비밀번호가 잘못되었습니다.');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('nickname', data.nickname);
            localStorage.setItem('username', data.username);

            toast({
                title: '로그인에 성공했습니다.',
                status: 'success',
                duration: 2000, // duration 단축
                isClosable: true,
                position: 'top', // 토스트 메시지 위치 변경
            });

            setTimeout(() => {
                navigate('/');
            }, 1000); // 1초 후 메인 페이지로 이동

        } catch (err) {
            setError(err.message);
            toast({
                title: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top', // 토스트 메시지 위치 변경
            });
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    return (
        <Center minH="100vh" bg="gray.100"> {/* 배경색 변경 및 중앙 정렬 */}
            <Box
                maxW="md" // Box의 최대 너비를 조금 더 넓게
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
                        <Icon as={FaUserShield} w={10} h={10} color="teal.500" /> {/* 아이콘 추가 */}
                        <Heading as="h1" size="xl" textAlign="center" color="teal.700">
                            로그인
                        </Heading>
                    </HStack>

                    <form onSubmit={handleLogin}>
                        <VStack spacing={4}>
                            <FormControl id="username">
                                <FormLabel fontSize="md" fontWeight="medium">아이디</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="아이디를 입력하세요"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    variant="filled" // 입력 필드 배경색 추가
                                    size="lg" // 입력 필드 크기 증가
                                />
                            </FormControl>

                            <FormControl id="password">
                                <FormLabel fontSize="md" fontWeight="medium">비밀번호</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                            <Button
                                colorScheme="teal" // 버튼 색상 변경
                                type="submit"
                                width="100%"
                                size="lg" // 버튼 크기 증가
                                isLoading={isLoading} // 로딩 상태 반영
                                loadingText="로그인 중..."
                                mt={4} // 상단 여백 추가
                                boxShadow="md" // 버튼에도 그림자 추가
                                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            >
                                로그인
                            </Button>
                        </VStack>
                    </form>

                    <HStack justify="center" spacing={6} pt={2}> {/* 여백 조정 */}
                        <Link to="/find-id">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                아이디 찾기
                            </Button>
                        </Link>
                        <Text color="gray.400">|</Text> {/* 구분선 추가 */}
                        <Link to="/find-password">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                비밀번호 찾기
                            </Button>
                        </Link>
                        <Text color="gray.400">|</Text> {/* 구분선 추가 */}
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