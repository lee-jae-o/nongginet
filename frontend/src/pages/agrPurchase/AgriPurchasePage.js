import { useEffect, useState, useRef } from 'react';
import {
    Box, Button, Select, VStack, Heading, Table, Thead, Tr, Th, Tbody, Td,
    Spinner, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text,
    HStack, IconButton, useToast, Flex, Input, FormControl, FormLabel
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'; // 페이지네이션 아이콘 추가

export default function AgriPurchasePage() {
    const [knmcList, setKnmcList] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [selectedKnmc, setSelectedKnmc] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [selectedMin, setSelectedMin] = useState(0);
    const [selectedMax, setSelectedMax] = useState(0);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [favorites2, setFavorites2] = useState([]);
    const [chart, setChart] = useState(null);
    const chartRef = useRef(null);
    const toast = useToast();

    const perPage = 10;
    const maxButtons = 5;

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await fetch('/api/agri-purchase/options');
                const data = await res.json();
                setKnmcList(data.machine_names);
                setYearList(data.years);
                setMinPrice(data.min_price);
                setMaxPrice(data.max_price);
                setSelectedMin(data.min_price);
                setSelectedMax(data.max_price);
            } catch (err) {
                console.error("옵션 불러오기 실패:", err);
                toast({
                    title: '데이터 로딩 실패',
                    description: '옵션 데이터를 불러오는 데 실패했습니다.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        };
        fetchOptions();
        fetchFavorites2();
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.async = true;
        document.head.appendChild(script);
        return () => {
            if (script.parentNode) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const fetchFavorites2 = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setFavorites2([]);
                return;
            }
            const res = await fetch('/api/favorite2/list', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    setFavorites2([]);
                    return;
                }
                throw new Error('즐겨찾기 목록 불러오기 실패');
            }
            const data = await res.json();
            setFavorites2(data.map(f => f.item_id));
        } catch (err) {
            console.error("즐겨찾기2 목록 불러오기 실패:", err);
            toast({
                title: '즐겨찾기 로딩 실패',
                description: '즐겨찾기 목록을 불러오는 데 문제가 발생했습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleFavorite2Toggle = async (item) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: '로그인이 필요합니다.',
                description: '즐겨찾기 기능을 이용하려면 로그인해주세요.',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const targetId = item?.frcnPcSeqNo;
        if (!targetId) return;

        const isFavorite = favorites2.includes(targetId);
        const url = isFavorite ? `/api/favorite2/remove/${targetId}` : '/api/favorite2/add';
        const method = isFavorite ? 'DELETE' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: isFavorite ? null : JSON.stringify({
                    item_id: targetId,
                    item_name: item.knmcNm,
                    manufacturer: item.mnfcNm || '제조사 정보 없음'
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || '즐겨찾기 토글 실패');
            }
            fetchFavorites2();
            toast({
                title: isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가',
                description: isFavorite ? '성공적으로 즐겨찾기에서 해제되었습니다.' : '성공적으로 즐겨찾기에 추가되었습니다.',
                status: 'success',
                duration: 1500,
                isClosable: true,
            });
        } catch (err) {
            console.error("즐겨찾기2 토글 실패:", err);
            toast({
                title: '오류 발생',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedKnmc) params.append('knmcNm', selectedKnmc);
            if (selectedYear) params.append('frcnPcYear', selectedYear);
            params.append('min_price', selectedMin);
            params.append('max_price', selectedMax);

            const res = await fetch(`/api/agri-purchase/search?${params.toString()}`);
            if (!res.ok) {
                throw new Error('검색 데이터를 불러오는데 실패했습니다.');
            }
            const data = await res.json();
            setResults(data);
            setCurrentPage(1);

            if (selectedKnmc) {
                const descRes = await fetch(`/api/agri-purchase/description/${selectedKnmc}`);
                if (!descRes.ok) {
                    throw new Error('기종 설명을 불러오는데 실패했습니다.');
                }
                const descData = await descRes.json();
                setDescription(descData.description || '선택된 기종에 대한 설명이 없습니다.');
            } else {
                setDescription('');
            }

            updateChart(data);
        } catch (err) {
            console.error("검색 실패:", err);
            toast({
                title: '검색 실패',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const getAveragePriceData = (data) => {
        const grouped = {};
        data.forEach(item => {
            const key = item.knmcNm;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(Number(item.totPc));
        });
        return Object.entries(grouped).map(([knmcNm, prices]) => ({
            knmcNm,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        }));
    };

    const updateChart = (data) => {
        if (!window.Chart || !chartRef.current) {
            console.warn("Chart.js 라이브러리 또는 캔버스 참조를 찾을 수 없습니다.");
            return;
        }
        if (chart) {
            chart.destroy();
        }

        const chartData = getAveragePriceData(data);
        const ctx = chartRef.current.getContext('2d');
        const newChart = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(item => item.knmcNm),
                datasets: [{
                    label: '평균 가격 (원)',
                    data: chartData.map(item => item.avgPrice),
                    backgroundColor: 'rgba(66, 153, 225, 0.8)', // 변경된 그래프 색상 (Chakra blue.400 계열)
                    borderColor: 'rgba(49, 130, 206, 1)',      // 변경된 그래프 테두리 색상 (Chakra blue.500 계열)
                    borderWidth: 1,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 15,
                            padding: 10,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `평균가격: ${context.parsed.y.toLocaleString()}원`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '원';
                            },
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        setChart(newChart);
    };

    const totalPages = Math.ceil(results.length / perPage);
    const paginatedResults = results.slice((currentPage - 1) * perPage, currentPage * perPage);

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return (
        <Box p={8} maxW="1200px" mx="auto" bg="gray.50" borderRadius="lg" shadow="xl">
            <Heading size="xl" mb={8} textAlign="center" color="teal.700" fontWeight="extrabold">
                농기계 구매 정보 검색
            </Heading>

            <VStack spacing={6} align="stretch" mb={8} p={6} bg="white" borderRadius="md" shadow="base">
                <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700">기종명 선택</FormLabel>
                    <Select
                        placeholder="전체 기종"
                        value={selectedKnmc}
                        onChange={(e) => setSelectedKnmc(e.target.value)}
                        size="lg"
                        variant="filled"
                        _hover={{ bg: "gray.100" }}
                        focusBorderColor="teal.500"
                    >
                        {knmcList.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700">연도 선택</FormLabel>
                    <Select
                        placeholder="전체 연도"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        size="lg"
                        variant="filled"
                        _hover={{ bg: "gray.100" }}
                        focusBorderColor="teal.500"
                    >
                        {yearList.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700">가격대 설정</FormLabel>
                    <VStack spacing={2}>
                        <Text fontSize="md" fontWeight="medium" color="gray.800">
                            최소: <Text as="span" color="teal.600" fontWeight="bold">{selectedMin.toLocaleString()}</Text>원
                        </Text>
                        <Slider
                            min={minPrice} max={maxPrice} step={100000}
                            value={selectedMin} onChange={(val) => setSelectedMin(val)}
                            focusThumbOnChange={false}
                        >
                            <SliderTrack bg="gray.200"><SliderFilledTrack bg="teal.500" /></SliderTrack>
                            <SliderThumb boxSize={5} borderColor="teal.500" borderWidth={2} />
                        </Slider>
                        <Text fontSize="md" fontWeight="medium" color="gray.800">
                            최대: <Text as="span" color="teal.600" fontWeight="bold">{selectedMax.toLocaleString()}</Text>원
                        </Text>
                        <Slider
                            min={minPrice} max={maxPrice} step={100000}
                            value={selectedMax} onChange={(val) => setSelectedMax(val)}
                            focusThumbOnChange={false}
                        >
                            <SliderTrack bg="gray.200"><SliderFilledTrack bg="teal.500" /></SliderTrack>
                            <SliderThumb boxSize={5} borderColor="teal.500" borderWidth={2} />
                        </Slider>
                    </VStack>
                </FormControl>

                <Button
                    colorScheme="teal"
                    onClick={handleSearch}
                    size="lg"
                    fontWeight="bold"
                    fontSize="lg"
                    py={3}
                    _hover={{ bg: "teal.600", transform: "translateY(-2px)", boxShadow: "lg" }}
                    _active={{ bg: "teal.700" }}
                    isLoading={loading}
                    loadingText="검색 중..."
                >
                    검색
                </Button>
            </VStack>

            {description && (
                <Box mb={8} p={6} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200" shadow="sm">
                    <Text fontWeight="bold" fontSize="lg" mb={3} color="blue.700">기종 설명</Text>
                    <Text color="gray.700" lineHeight="tall">{description}</Text>
                </Box>
            )}

            {results.length > 0 && (
                // <Box mb={8} p={6} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200" shadow="base">
                //     <Text fontWeight="bold" fontSize="lg" mb={4} color="teal.700" textAlign="center">
                //         기종별 평균 가격
                //     </Text>
                //     <Box w="100%" h="350px">
                //         <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
                //     </Box>
                // </Box>
                <Box mb={8} p={6} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200" shadow="base">
                    <Text fontWeight="bold" fontSize="lg" mb={1} color="teal.700" textAlign="center">
                      기종별 평균 가격
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                      현재 검색 조건에 해당하는 기종들의 평균 가격입니다.
                    </Text>
                    <Box w="100%" h="350px">
                      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
                    </Box>
                </Box>

            )}

            {loading ? (
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="teal.500" thickness="4px" speed="0.65s" />
                    <Text ml={4} fontSize="xl" color="gray.600">데이터를 불러오는 중...</Text>
                </Flex>
            ) : (
                paginatedResults.length > 0 ? (
                    <>
                        <Box overflowX="auto" shadow="md" borderRadius="md" mb={6}>
                            <Table variant="striped" colorScheme="gray" size="md">
                              <Thead bg="teal.500">
                                <Tr>
                                  <Th color="white">즐겨찾기</Th>
                                  <Th color="white">기종명</Th>
                                  <Th color="white">형식명</Th>
                                  <Th color="white">제조사</Th>
                                  <Th color="white">연도</Th>
                                  <Th color="white">총가격</Th>
                                  <Th color="white">일반가격</Th>
                                  <Th color="white">전업농가격</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {paginatedResults.map((item, idx) => {
                                  const targetId = item.frcnPcSeqNo;
                                  return (
                                    <Tr key={idx} _hover={{ bg: "teal.50" }}>
                                      <Td>
                                        <IconButton
                                          icon={<StarIcon color={favorites2.includes(targetId) ? 'yellow.400' : 'gray.300'} />}
                                          size="sm"
                                          onClick={() => handleFavorite2Toggle(item)}
                                          aria-label="즐겨찾기 토글"
                                          variant="ghost"
                                          _hover={{ bg: "transparent" }}
                                        />
                                      </Td>
                                      <Td fontWeight="semibold" color="gray.800">{item.knmcNm}</Td>
                                      <Td>{item.fomNm}</Td>
                                      <Td>{item.mnfcNm || '-'}</Td>
                                      <Td>{item.frcnPcYear}</Td>
                                      <Td>{item.totPc ? `${item.totPc.toLocaleString()}원` : '-'}</Td>
                                      <Td>{item.gnrlfrmhsSportPc ? `${item.gnrlfrmhsSportPc.toLocaleString()}원` : '-'}</Td>
                                      <Td>{item.copertnHghltExcfmSportPc ? `${item.copertnHghltExcfmSportPc.toLocaleString()}원` : '-'}</Td>
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>

                        </Box>

                        {/* Pagination */}
                        <HStack spacing={2} mt={6} justify="center" flexWrap="wrap">
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                isDisabled={currentPage === 1}
                                variant="outline"
                                colorScheme="teal"
                                leftIcon={<FaAngleDoubleLeft />}
                                _hover={{ bg: "teal.50", borderColor: "teal.300" }}
                            >
                                맨앞
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                                variant="outline"
                                colorScheme="teal"
                                leftIcon={<FaChevronLeft />}
                                _hover={{ bg: "teal.50", borderColor: "teal.300" }}
                            >
                                이전
                            </Button>
                            {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                const page = startPage + i;
                                return (
                                    <Button
                                        key={page}
                                        size="sm"
                                        colorScheme={page === currentPage ? "teal" : "gray"}
                                        onClick={() => setCurrentPage(page)}
                                        variant={page === currentPage ? "solid" : "outline"}
                                        _hover={{ bg: page === currentPage ? "teal.600" : "gray.100" }}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                isDisabled={currentPage === totalPages}
                                variant="outline"
                                colorScheme="teal"
                                rightIcon={<FaChevronRight />}
                                _hover={{ bg: "teal.50", borderColor: "teal.300" }}
                            >
                                다음
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                isDisabled={currentPage === totalPages}
                                variant="outline"
                                colorScheme="teal"
                                rightIcon={<FaAngleDoubleRight />}
                                _hover={{ bg: "teal.50", borderColor: "teal.300" }}
                            >
                                맨뒤
                            </Button>
                        </HStack>
                    </>
                ) : (
                    results.length === 0 && !loading ? (
                        <Box textAlign="center" py={10} bg="white" borderRadius="md" shadow="base">
                            <Text fontSize="xl" color="gray.500" fontWeight="medium">
                                검색 결과가 없습니다. 조건을 변경하여 다시 검색해 주세요.
                            </Text>
                        </Box>
                    ) : null
                )
            )}
        </Box>
    );
}