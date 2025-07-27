import { useState, useEffect } from 'react'; // useEffect 추가
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Link 추가
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    VStack,
    useToast,
    Text,
    Center,
    Heading,
    Icon,
    HStack,
} from '@chakra-ui/react';
import { FaLockOpen } from 'react-icons/fa'; // 비밀번호 재설정 아이콘 추가

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    // location.state에서 username 가져오기, 없으면 빈 문자열
    const username = location.state?.username || ''; 

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    // username이 없으면 잘못된 접근으로 처리하고 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (!username) {
            toast({
                title: '잘못된 접근입니다.',
                description: '비밀번호 찾기 페이지를 통해 접근해주세요.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            navigate('/find-password', { replace: true }); // 이전 페이지 히스토리 제거
        }
    }, [username, navigate, toast]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // 로딩 시작

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            toast({
                title: '비밀번호 불일치',
                description: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            setIsLoading(false);
            return;
        }
        
        if (!newPassword || newPassword.length < 4) { // 비밀번호 최소 길이 설정 (예시)
            setError('비밀번호는 4자 이상이어야 합니다.');
            toast({
                title: '비밀번호 길이 부족',
                description: '비밀번호는 최소 4자 이상이어야 합니다.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, new_password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '비밀번호 재설정 실패');
            }

            toast({
                title: '비밀번호 변경 성공!',
                description: '새 비밀번호로 로그인해주세요.',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            
            // 1초 후 로그인 페이지로 이동
            setTimeout(() => {
                navigate('/login', { replace: true }); // 비밀번호 재설정 페이지는 히스토리에서 제거
            }, 1000);

        } catch (err) {
            setError(err.message);
            toast({
                title: '비밀번호 변경 실패',
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

    // username이 없는 경우 (잘못된 접근 시) 렌더링 방지
    if (!username && !location.state?.username) {
        return null; 
    }

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
                        <Icon as={FaLockOpen} w={10} h={10} color="teal.500" />
                        <Heading as="h1" size="xl" textAlign="center" color="teal.700">
                            비밀번호 재설정
                        </Heading>
                    </HStack>

                    <Text fontSize="md" textAlign="center" color="gray.600" mb={4}>
                        <Text as="span" fontWeight="bold" color="teal.600">{username}</Text> 님의 새 비밀번호를 설정해주세요.
                    </Text>

                    <form onSubmit={handleResetPassword}>
                        <VStack spacing={4}>
                            <FormControl id="new-password">
                                <FormLabel fontSize="md" fontWeight="medium">새 비밀번호</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="새 비밀번호 (4자 이상)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    variant="filled"
                                    size="lg"
                                />
                            </FormControl>

                            <FormControl id="confirm-password" isInvalid={newPassword && confirmPassword && newPassword !== confirmPassword}>
                                <FormLabel fontSize="md" fontWeight="medium">새 비밀번호 확인</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="새 비밀번호 다시 입력"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    variant="filled"
                                    size="lg"
                                />
                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <FormErrorMessage>비밀번호가 일치하지 않습니다.</FormErrorMessage>
                                )}
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
                                loadingText="변경 중..."
                                mt={4}
                                boxShadow="md"
                                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            >
                                비밀번호 변경
                            </Button>
                        </VStack>
                    </form>
                    <HStack justify="center" spacing={4} pt={2}>
                        <Link to="/login">
                            <Button variant="link" color="gray.600" fontSize="sm" _hover={{ color: 'teal.500' }}>
                                로그인 페이지로
                            </Button>
                        </Link>
                    </HStack>
                </VStack>
            </Box>
        </Center>
    );
}