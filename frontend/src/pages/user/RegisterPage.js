import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    VStack,
    HStack,
    useToast,
    Text,
    Center, // Center 컴포넌트 추가
    Heading, // Heading 컴포넌트 추가
    Icon, // Icon 컴포넌트 추가 (react-icons 사용 시 필요)
    Spinner // 로딩 스피너 추가
} from '@chakra-ui/react';
import { FaUserPlus } from 'react-icons/fa'; // 회원가입 관련 아이콘 추가

export default function RegisterPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState({
        username: '',
        password1: '',
        password2: '',
        name: '',
        email: '',
        nickname: ''
    });

    const [error, setError] = useState('');
    const [validation, setValidation] = useState({
        username: null,
        email: null,
        nickname: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // 회원가입 제출 로딩 상태
    const [checkingStatus, setCheckingStatus] = useState({ // 중복 체크 로딩 상태
        username: false,
        email: false,
        nickname: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // 입력값 변경 시 해당 필드의 유효성 상태 초기화
        setValidation((prev) => ({
            ...prev,
            [name]: null,
        }));
        // 비밀번호 필드 변경 시 에러 메시지 초기화
        if (name === 'password1' || name === 'password2') {
            setError('');
        }
    };

    // 중복 체크 요청
    const handleValidation = async (field) => {
        if (!formData[field]) {
            toast({
                title: `${field === 'username' ? '아이디' : field === 'email' ? '이메일' : '닉네임'}를 입력해주세요.`,
                status: 'warning',
                duration: 2000,
                isClosable: true,
                position: 'top',
            });
            return;
        }

        setCheckingStatus((prev) => ({ ...prev, [field]: true })); // 중복 체크 로딩 시작
        try {
            const response = await fetch(`/api/user/check-${field}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: formData[field] })
            });

            if (response.ok) {
                setValidation((prev) => ({ ...prev, [field]: true }));
                const fieldMessage = {
                    username: "사용 가능한 아이디 입니다.",
                    email: "사용 가능한 이메일 입니다.",
                    nickname: "사용 가능한 닉네임 입니다."
                };
                toast({
                    title: fieldMessage[field],
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                    position: 'top',
                });
            } else {
                setValidation((prev) => ({ ...prev, [field]: false }));
                const fieldMessage = {
                    username: "이미 존재하는 아이디 입니다.",
                    email: "이미 존재하는 이메일 입니다.",
                    nickname: "이미 존재하는 닉네임 입니다."
                };
                toast({
                    title: fieldMessage[field],
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: '중복 확인 중 오류가 발생했습니다.',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setCheckingStatus((prev) => ({ ...prev, [field]: false })); // 중복 체크 로딩 종료
        }
    };

    // 회원가입 요청
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // 모든 필수 필드 입력 확인
        for (const key in formData) {
            if (!formData[key]) {
                toast({
                    title: '모든 필드를 입력해주세요.',
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                    position: 'top',
                });
                return;
            }
        }

        // 중복 체크가 완료되었는지 확인 (null이 아니어야 함)
        if (validation.username !== true || validation.email !== true || validation.nickname !== true) {
            toast({
                title: '아이디, 이메일, 닉네임 중복 체크를 완료해주세요.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            return;
        }

        // 비밀번호 불일치 체크
        if (formData.password1 !== formData.password2) {
            setError("비밀번호가 일치하지 않습니다.");
            toast({
                title: '비밀번호가 일치하지 않습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            return;
        }

        setIsSubmitting(true); // 회원가입 제출 로딩 시작
        try {
            const response = await fetch('/api/user/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '회원가입 실패');
            }

            toast({
                title: '회원가입이 성공했습니다!',
                description: '로그인 페이지로 이동합니다.',
                status: 'success',
                duration: 2000,
                isClosable: true,
                position: 'top',
            });

            setTimeout(() => {
                navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
            }, 1000);

        } catch (err) {
            setError(err.message);
            toast({
                title: '회원가입 실패',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsSubmitting(false); // 회원가입 제출 로딩 종료
        }
    };

    const getValidationIcon = (field) => {
        if (validation[field] === true) {
            return { color: 'green.500', name: 'check-circle' }; // Check icon
        } else if (validation[field] === false) {
            return { color: 'red.500', name: 'close' }; // Close icon
        }
        return null;
    };

    return (
        <Center minH="100vh" bg="gray.100"> {/* 배경색 및 중앙 정렬 */}
            <Box
                maxW="lg" // Box의 최대 너비
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
                        <Icon as={FaUserPlus} w={10} h={10} color="teal.500" /> {/* 아이콘 추가 */}
                        <Heading as="h1" size="xl" textAlign="center" color="teal.700">
                            회원가입
                        </Heading>
                    </HStack>

                    <form onSubmit={handleRegister}>
                        <VStack spacing={4}>
                            <FormControl id="username" isInvalid={validation.username === false}>
                                <FormLabel fontSize="md" fontWeight="medium">아이디</FormLabel>
                                <HStack>
                                    <Input
                                        name="username"
                                        placeholder="아이디를 입력하세요"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        variant="filled"
                                        size="lg"
                                    />
                                    <Button
                                        colorScheme="teal"
                                        onClick={() => handleValidation('username')}
                                        isLoading={checkingStatus.username}
                                        loadingText="확인 중"
                                        flexShrink={0}
                                        size="lg"
                                        boxShadow="sm"
                                    >
                                        중복 확인
                                    </Button>
                                </HStack>
                                {validation.username === false && (
                                    <FormErrorMessage>이미 존재하는 아이디입니다.</FormErrorMessage>
                                )}
                                {validation.username === true && (
                                    <Text color="green.500" fontSize="sm" mt={1}>사용 가능한 아이디입니다.</Text>
                                )}
                            </FormControl>

                            <FormControl id="email" isInvalid={validation.email === false}>
                                <FormLabel fontSize="md" fontWeight="medium">이메일</FormLabel>
                                <HStack>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="이메일을 입력하세요"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        variant="filled"
                                        size="lg"
                                    />
                                    <Button
                                        colorScheme="teal"
                                        onClick={() => handleValidation('email')}
                                        isLoading={checkingStatus.email}
                                        loadingText="확인 중"
                                        flexShrink={0}
                                        size="lg"
                                        boxShadow="sm"
                                    >
                                        중복 확인
                                    </Button>
                                </HStack>
                                {validation.email === false && (
                                    <FormErrorMessage>이미 존재하는 이메일입니다.</FormErrorMessage>
                                )}
                                {validation.email === true && (
                                    <Text color="green.500" fontSize="sm" mt={1}>사용 가능한 이메일입니다.</Text>
                                )}
                            </FormControl>

                            <FormControl id="nickname" isInvalid={validation.nickname === false}>
                                <FormLabel fontSize="md" fontWeight="medium">닉네임</FormLabel>
                                <HStack>
                                    <Input
                                        name="nickname"
                                        placeholder="닉네임을 입력하세요"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                        required
                                        variant="filled"
                                        size="lg"
                                    />
                                    <Button
                                        colorScheme="teal"
                                        onClick={() => handleValidation('nickname')}
                                        isLoading={checkingStatus.nickname}
                                        loadingText="확인 중"
                                        flexShrink={0}
                                        size="lg"
                                        boxShadow="sm"
                                    >
                                        중복 확인
                                    </Button>
                                </HStack>
                                {validation.nickname === false && (
                                    <FormErrorMessage>이미 존재하는 닉네임입니다.</FormErrorMessage>
                                )}
                                {validation.nickname === true && (
                                    <Text color="green.500" fontSize="sm" mt={1}>사용 가능한 닉네임입니다.</Text>
                                )}
                            </FormControl>

                            <FormControl id="password-1">
                                <FormLabel fontSize="md" fontWeight="medium">비밀번호</FormLabel>
                                <Input
                                    type="password"
                                    name="password1"
                                    placeholder="비밀번호를 입력하세요"
                                    value={formData.password1}
                                    onChange={handleChange}
                                    required
                                    variant="filled"
                                    size="lg"
                                />
                            </FormControl>

                            <FormControl id="password-2" isInvalid={formData.password1 && formData.password2 && formData.password1 !== formData.password2}>
                                <FormLabel fontSize="md" fontWeight="medium">비밀번호 확인</FormLabel>
                                <Input
                                    type="password"
                                    name="password2"
                                    placeholder="비밀번호를 다시 입력하세요"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    required
                                    variant="filled"
                                    size="lg"
                                />
                                {formData.password1 && formData.password2 && formData.password1 !== formData.password2 && (
                                    <FormErrorMessage>비밀번호가 일치하지 않습니다.</FormErrorMessage>
                                )}
                            </FormControl>

                            <FormControl id="name">
                                <FormLabel fontSize="md" fontWeight="medium">이름</FormLabel>
                                <Input
                                    name="name"
                                    placeholder="이름을 입력하세요"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="filled"
                                    size="lg"
                                />
                            </FormControl>

                            {error && <Text color="red.500" fontSize="sm" textAlign="center">{error}</Text>}

                            <Button
                                colorScheme="teal"
                                type="submit"
                                width="100%"
                                size="lg"
                                mt={4}
                                boxShadow="md"
                                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                                isLoading={isSubmitting} // 회원가입 버튼 로딩 상태
                                loadingText="가입 중..."
                            >
                                회원가입
                            </Button>
                        </VStack>
                    </form>
                </VStack>
            </Box>
        </Center>
    );
}