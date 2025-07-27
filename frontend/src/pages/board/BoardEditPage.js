import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Input,
    Textarea,
    Button,
    VStack,
    Heading,
    useToast,
    Spinner,
    Center, // Center 추가
    Alert, AlertIcon, // Alert 추가
} from '@chakra-ui/react';

export default function BoardEditPage() {
    const { boardId } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 추가
    const [error, setError] = useState(null); // 에러 상태 추가
    const toast = useToast();
    const navigate = useNavigate();

    // 기존 데이터 로딩
    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/board/${boardId}`);
                if (!response.ok) {
                    throw new Error("게시글을 불러오는 데 실패했습니다.");
                }
                const data = await response.json();
                setTitle(data.title);
                setContent(data.content);
            } catch (error) {
                console.error(error.message);
                setError(error.message); // 에러 메시지 설정
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [boardId]);

    // 수정 핸들러
    const handleEdit = async () => {
        const confirmed = window.confirm("정말로 게시글을 수정하시겠습니까?");
        if (!confirmed) return;

        if (!title.trim() || !content.trim()) {
            toast({
                title: "제목과 내용을 모두 입력해주세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
             toast({
                title: "로그인이 필요합니다.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true); // 제출 시작

        try {
            const response = await fetch(`/api/board/${boardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "게시글 수정에 실패했습니다.");
            }

            toast({
                title: "게시글이 성공적으로 수정되었습니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            navigate(`/board/${boardId}`, { replace: true });
        } catch (error) {
            toast({
                title: "게시글 수정 실패",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false); // 제출 종료
        }
    };

    if (loading) {
        return (
            <Center py={10}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
            </Center>
        );
    }

    if (error) {
        return (
            <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
                <Button mt={4} onClick={() => navigate('/board')}>목록으로 돌아가기</Button>
            </Box>
        );
    }

    return (
        <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
            <VStack spacing={6} align="stretch"> {/* 간격 조정 */}
                <Heading as="h1" size="xl" textAlign="center" color="teal.600" mb={4}>
                    게시글 수정하기
                </Heading>

                <Input
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="lg"
                    borderRadius="md"
                    borderColor="gray.300"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                />
                <Textarea
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    size="lg"
                    borderRadius="md"
                    borderColor="gray.300"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                />
                <Button
                    colorScheme="teal"
                    onClick={handleEdit}
                    isLoading={isSubmitting}
                    loadingText="수정 중..."
                    size="lg"
                    width="full"
                    borderRadius="md"
                    _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
                    _active={{ bg: "teal.700" }}
                >
                    수정 완료
                </Button>
            </VStack>
        </Box>
    );
}