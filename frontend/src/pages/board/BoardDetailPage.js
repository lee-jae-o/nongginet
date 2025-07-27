import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    VStack,
    Divider,
    Spinner,
    Input,
    Button,
    HStack,
    useToast,
    Flex,
    Spacer, // Spacer 추가
    Alert, AlertIcon, // Alert 추가
    Center,
} from '@chakra-ui/react';

export default function BoardDetailPage() {
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [boardError, setBoardError] = useState(null); // 게시글 로딩 에러
    const [commentError, setCommentError] = useState(null); // 댓글 로딩 에러
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const username = localStorage.getItem('nickname');
    const token = localStorage.getItem('token');

    // 게시글 정보 및 댓글 가져오기
    useEffect(() => {
        const fetchBoardAndComments = async () => {
            setLoading(true);
            setBoardError(null);
            setCommentError(null);
            try {
                // 게시글 정보 가져오기
                const boardResponse = await fetch(`/api/board/${boardId}`);
                if (!boardResponse.ok) {
                    throw new Error("게시글을 불러오는 데 실패했습니다.");
                }
                const boardData = await boardResponse.json();
                setBoard(boardData);

                // 댓글 정보 가져오기
                const commentsResponse = await fetch(`/api/comments/${boardId}`);
                if (!commentsResponse.ok) {
                    throw new Error("댓글을 불러오는 데 실패했습니다.");
                }
                const commentsData = await commentsResponse.json();
                setComments(commentsData);

            } catch (error) {
                console.error("📌 데이터 요청 실패:", error.message);
                // 에러 타입에 따라 분리하여 설정 가능
                if (error.message.includes("게시글")) {
                    setBoardError(error.message);
                } else if (error.message.includes("댓글")) {
                    setCommentError(error.message);
                } else {
                    setBoardError("데이터를 불러오는 데 문제가 발생했습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBoardAndComments();
    }, [boardId]);

    // 수정 페이지로 이동
    const handleEdit = () => {
        navigate(`/board/edit/${boardId}`);
    };

    // 게시글 삭제 핸들러
    const handleDelete = async () => {
        const confirmed = window.confirm("정말로 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/board/${boardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "게시글 삭제에 실패했습니다.");
            }

            toast({
                title: "게시글이 성공적으로 삭제되었습니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            navigate('/board', { replace: true });

        } catch (error) {
            toast({
                title: "게시글 삭제 실패",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // 댓글 작성 핸들러
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast({
                title: "댓글 내용을 입력하세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        if (!token) {
             toast({
                title: "로그인이 필요합니다.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/comments/${boardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "댓글 작성에 실패했습니다.");
            }

            const data = await response.json();
            setComments((prevComments) => [...prevComments, data]);
            setNewComment('');

            toast({
                title: "댓글이 성공적으로 작성되었습니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "댓글 작성 실패",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Center py={10}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
            </Center>
        );
    }

    if (boardError) {
        return (
            <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {boardError}
                </Alert>
                <Button mt={4} onClick={() => navigate('/board')}>목록으로 돌아가기</Button>
            </Box>
        );
    }

    if (!board) {
        return (
            <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
                <Text fontSize="xl" color="gray.600" textAlign="center">게시글을 찾을 수 없습니다.</Text>
                <Button mt={4} onClick={() => navigate('/board')}>목록으로 돌아가기</Button>
            </Box>
        );
    }

    return (
        <Box p={{ base: 4, md: 8 }} maxWidth="800px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
            <VStack align="start" spacing={5}> {/* 간격 조정 */}
                <Heading as="h1" size="xl" color="gray.800">{board.title}</Heading>
                <HStack spacing={4} color="gray.600" fontSize="md" wrap="wrap">
                    <Text>작성자: <Text as="span" fontWeight="medium" color="teal.600">{board.author_nickname}</Text></Text>
                    <Text>작성일: {new Date(board.created_at).toLocaleDateString()}</Text>
                    <Text>조회수: {board.views}</Text>
                </HStack>
                <Divider borderColor="gray.300" />

                {/* 수정, 삭제 버튼 */}
                {board.author_nickname === username && (
                    <Flex mt={2} gap={3}>
                        <Button
                            colorScheme="blue"
                            onClick={handleEdit}
                            size="md"
                            borderRadius="md"
                            _hover={{ bg: "blue.500", transform: "translateY(-1px)" }}
                        >
                            수정
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDelete}
                            size="md"
                            borderRadius="md"
                            _hover={{ bg: "red.500", transform: "translateY(-1px)" }}
                        >
                            삭제
                        </Button>
                    </Flex>
                )}

                <Box w="100%" bg="gray.50" p={6} borderRadius="lg" border="1px solid" borderColor="gray.200" minH="150px">
                    <Text fontSize="lg" whiteSpace="pre-line" color="gray.800">{board.content}</Text>
                </Box>

                <Divider mt={6} borderColor="gray.300" />

                {/* 댓글 작성 */}
                <Heading as="h2" size="md" color="teal.700" mt={4}>댓글</Heading>
                <HStack mt={3} w="100%">
                    <Input
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        borderColor="gray.300"
                        _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                    />
                    <Button
                        colorScheme="teal"
                        onClick={handleAddComment}
                        isLoading={isSubmitting}
                        loadingText="작성 중..."
                        size="lg"
                        borderRadius="md"
                        _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
                    >
                        작성
                    </Button>
                </HStack>

                {/* 댓글 목록 */}
                <VStack align="start" spacing={4} w="100%" mt={4}>
                    {commentError && (
                        <Alert status="error" borderRadius="md" w="100%">
                            <AlertIcon />
                            {commentError}
                        </Alert>
                    )}
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                username={username}
                                token={token}
                                setComments={setComments}
                            />
                        ))
                    ) : (
                        !commentError && <Text fontSize="md" color="gray.500">댓글이 없습니다. 첫 댓글을 남겨보세요!</Text>
                    )}
                </VStack>
                <Flex w="100%" justify="flex-end" mt={4}>
                    <Button colorScheme="gray" variant="outline" onClick={() => navigate('/board')} borderRadius="md">
                        목록으로 돌아가기
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
}

function CommentItem({ comment, username, token, setComments }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const toast = useToast();

    // 수정 핸들러
    const handleUpdateComment = async () => {
        if (!editContent.trim()) {
            toast({
                title: "댓글 내용을 입력하세요.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "댓글 수정에 실패했습니다.");
            }

            setComments((prev) =>
                prev.map((item) => (item.id === comment.id ? { ...item, content: editContent } : item))
            );
            setIsEditing(false);

            toast({
                title: "댓글이 성공적으로 수정되었습니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            toast({
                title: "댓글 수정 실패",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // 삭제 핸들러
    const handleDeleteComment = async () => {
        if (!window.confirm("정말로 댓글을 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "삭제 권한이 없거나 댓글이 존재하지 않습니다.");
            }

            setComments((prev) => prev.filter((item) => item.id !== comment.id));

            toast({
                title: "댓글이 성공적으로 삭제되었습니다.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            toast({
                title: "댓글 삭제 실패",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" w="100%" bg="white" boxShadow="sm"> {/* 스타일 개선 */}
            <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" color="teal.700">{comment.author_nickname}</Text>
                {comment.author_nickname === username && (
                    <HStack spacing={2}>
                        {!isEditing ? (
                            <Button size="sm" variant="outline" colorScheme="blue" onClick={() => setIsEditing(true)}>수정</Button>
                        ) : (
                            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => setIsEditing(false)}>취소</Button>
                        )}
                        <Button size="sm" colorScheme="red" variant="outline" onClick={handleDeleteComment}>삭제</Button>
                    </HStack>
                )}
            </HStack>
            {isEditing ? (
                <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    size="sm"
                    borderRadius="md"
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                    mb={2}
                />
            ) : (
                <Text fontSize="md" color="gray.800">{comment.content}</Text>
            )}
            {isEditing && (
                <Button size="sm" colorScheme="blue" mt={2} onClick={handleUpdateComment} borderRadius="md">
                    수정 완료
                </Button>
            )}
             <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                {new Date(comment.created_at).toLocaleString()} {/* 날짜 형식 변경 */}
            </Text>
        </Box>
    );
}