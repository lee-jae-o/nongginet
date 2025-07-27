import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Input,
    Textarea,
    Button,
    VStack,
    Heading,
    useToast,
    Alert, AlertIcon, // Alert 추가
    Center, // Center 추가
} from '@chakra-ui/react';

export default function BoardCreatePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 추가
    const toast = useToast();
    const navigate = useNavigate();

    const handleCreateBoard = async () => {
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

        if (!title.trim() || !content.trim()) {
            toast({
                title: "제목과 내용을 모두 입력해주세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true); // 제출 시작

        try {
            const response = await fetch('/api/board', {
                method: 'POST',
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
                throw new Error(errorData.detail || "게시글 생성에 실패했습니다.");
            }

            toast({
                title: '게시글이 성공적으로 작성되었습니다.', // 메시지 상세화
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate('/board', { replace: true });
        } catch (error) {
            toast({
                title: "게시글 작성 실패", // 제목 일반화
                description: error.message, // 상세 오류 메시지를 description으로
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            console.error("게시글 생성 오류:", error.message);
        } finally {
            setIsSubmitting(false); // 제출 종료
        }
    };

    return (
        <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
            <VStack spacing={6} align="stretch"> {/* 간격 조정 */}
                <Heading as="h1" size="xl" textAlign="center" color="teal.600" mb={4}>
                    새 게시글 작성
                </Heading>

                <Input
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="lg" // 크기 조정
                    borderRadius="md"
                    borderColor="gray.300"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                />
                <Textarea
                    placeholder="내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10} // 행 높이 조정
                    size="lg" // 크기 조정
                    borderRadius="md"
                    borderColor="gray.300"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                />
                <Button
                    colorScheme="teal"
                    onClick={handleCreateBoard}
                    isLoading={isSubmitting} // 로딩 상태 반영
                    loadingText="작성 중..." // 로딩 텍스트
                    size="lg" // 크기 조정
                    width="full" // 너비 꽉 채우기
                    borderRadius="md"
                    _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
                    _active={{ bg: "teal.700" }}
                >
                    게시글 작성 완료
                </Button>
            </VStack>
        </Box>
    );
}