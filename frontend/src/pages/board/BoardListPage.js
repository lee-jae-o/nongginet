import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Button,
    VStack,
    Card,
    CardBody,
    Text,
    Flex,
    Spacer,
    HStack,
    Spinner, // 로딩 스피너 추가
    Center, // 스피너 중앙 정렬을 위해 추가
    Alert, AlertIcon, // 에러 메시지 표시를 위해 추가
} from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, EditIcon } from '@chakra-ui/icons'; // EditIcon 추가 (새 글 작성 아이콘으로 활용)

export default function BoardListPage() {
    const [boards, setBoards] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [error, setError] = useState(null); // 에러 상태 추가
    const limit = 3;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBoards = async () => {
            setLoading(true); // 로딩 시작
            setError(null); // 에러 초기화
            try {
                const response = await fetch(`/api/board?skip=${page * limit}&limit=${limit}`);
                if (!response.ok) {
                    throw new Error("게시글을 불러오는 데 실패했습니다.");
                }
                const data = await response.json();
                setBoards(data);

                const totalResponse = await fetch(`/api/board/total`);
                if (!totalResponse.ok) {
                    throw new Error("전체 게시글 수를 불러오는 데 실패했습니다.");
                }
                const { total } = await totalResponse.json();
                setTotalPages(Math.ceil(total / limit));
            } catch (error) {
                console.error("게시글 로딩 오류:", error);
                setError(error.message); // 에러 메시지 설정
            } finally {
                setLoading(false); // 로딩 종료
            }
        };
        fetchBoards();
    }, [page, limit]); // limit도 의존성 배열에 추가 (변할 일은 없지만 명시적으로)

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage((prev) => prev + 1);
        }
    };

    const renderPageButtons = () => {
        const buttons = [];
        const maxPageButtons = 5; // 최대 5개 페이지 버튼 표시
        let startPage = Math.max(0, page - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons);

        // 끝 페이지가 부족할 경우 시작 페이지 조정
        if (endPage - startPage < maxPageButtons && totalPages > maxPageButtons) {
            startPage = Math.max(0, endPage - maxPageButtons);
        }


        for (let i = startPage; i < endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    colorScheme={i === page ? "teal" : "gray"} // 현재 페이지 강조 색상 변경
                    variant={i === page ? "solid" : "outline"} // 현재 페이지 버튼 스타일 변경
                    onClick={() => handlePageClick(i)}
                    fontWeight={i === page ? "bold" : "normal"}
                    minW="40px" // 버튼 최소 너비 설정
                >
                    {i + 1}
                </Button>
            );
        }
        return buttons;
    };

    const handleBoardClick = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    const handleCreateBoard = () => {
        navigate('/board/create');
    };

    return (
        <Box p={{ base: 4, md: 8 }} maxWidth="1200px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
            <Flex mb={6} align="center">
                <Heading as="h1" size="xl" color="teal.600">게시글 목록</Heading>
                <Spacer />
                <Button
                    colorScheme="teal"
                    onClick={handleCreateBoard}
                    size="lg" // 버튼 크기 키움
                    leftIcon={<EditIcon />} // 아이콘 변경
                    _hover={{ bg: "teal.500", transform: "translateY(-1px)" }}
                    _active={{ bg: "teal.700" }}
                    borderRadius="md"
                >
                    새 글 작성
                </Button>
            </Flex>

            {loading ? (
                <Center py={10}>
                    <Spinner size="xl" color="teal.500" thickness="4px" />
                </Center>
            ) : error ? (
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            ) : (
                <VStack spacing={5} align="stretch"> {/* 간격 조정 */}
                    {boards.length > 0 ? (
                        boards.map((board) => (
                            <Card
                                key={board.id}
                                w="100%"
                                onClick={() => handleBoardClick(board.id)}
                                cursor="pointer"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }} // 호버 효과
                                transition="all 0.2s ease-in-out" // 부드러운 전환
                                borderRadius="lg" // 둥근 모서리
                                boxShadow="md" // 그림자
                            >
                                <CardBody p={5}> {/* 패딩 조정 */}
                                    <Text fontSize="xl" fontWeight="bold" mb={2} color="gray.800">
                                        {board.title}
                                    </Text>
                                    <HStack spacing={4} fontSize="sm" color="gray.600" wrap="wrap"> {/* 정보 가로 정렬 */}
                                        <Text>작성자: {board.author_nickname}</Text>
                                        <Text>작성일: {new Date(board.created_at).toLocaleDateString()}</Text>
                                        <Text>조회수: {board.views}</Text>
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))
                    ) : (
                        <Text textAlign="center" py={10} fontSize="lg" color="gray.500">
                            작성된 게시글이 없습니다. 첫 게시글을 작성해보세요!
                        </Text>
                    )}
                </VStack>
            )}


            <HStack mt={8} spacing={2} justifyContent="center"> {/* 간격 및 중앙 정렬 */}
                <Button
                    onClick={() => handlePageClick(0)}
                    isDisabled={page === 0}
                    variant="outline"
                    colorScheme="teal"
                    minW="80px"
                >
                    맨 앞
                </Button>

                <Button
                    onClick={handlePreviousPage}
                    isDisabled={page === 0}
                    variant="ghost" // 고스트 스타일
                    colorScheme="teal"
                >
                    <ArrowLeftIcon />
                </Button>

                {renderPageButtons()}

                <Button
                    onClick={handleNextPage}
                    isDisabled={page === totalPages - 1}
                    variant="ghost" // 고스트 스타일
                    colorScheme="teal"
                >
                    <ArrowRightIcon />
                </Button>

                <Button
                    onClick={() => handlePageClick(totalPages - 1)}
                    isDisabled={page === totalPages - 1}
                    variant="outline"
                    colorScheme="teal"
                    minW="80px"
                >
                    맨 뒤
                </Button>
            </HStack>
        </Box>
    );
}