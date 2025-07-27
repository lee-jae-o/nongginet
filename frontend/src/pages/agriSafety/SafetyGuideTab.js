import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  Button,
  HStack,
  Input,
  Center, // Center 추가
  Alert, AlertIcon, // Alert 추가
} from '@chakra-ui/react';

const ITEMS_PER_PAGE = 10;

export default function SafetyGuideTab() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/agri-safety/safety-guide');
        if (!res.ok) {
          throw new Error(`데이터 로드 실패: ${res.status}`);
        }
        const json = await res.json();
        const sorted = Array.isArray(json.items)
          ? [...json.items].sort((a, b) => Number(a.cntntsNo) - Number(b.cntntsNo))
          : [];
        setData(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error('Error fetching safety guide:', err);
        setError("데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const kw = e.target.value;
    setKeyword(kw);
    if (!kw.trim()) {
      setFiltered(data);
      setCurrentPage(1);
      return;
    }

    const lower = kw.toLowerCase();
    const result = data.filter(
      (item) =>
        (item.cntntsSj && item.cntntsSj.toLowerCase().includes(lower)) ||
        (item.cn && item.cn.toLowerCase().includes(lower)) ||
        (item.knmcNm && item.knmcNm.toLowerCase().includes(lower))
    );
    setFiltered(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Box p={5} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="lg" textAlign="center" mb={6} color="teal.700">
        농기계 안전이용 지침
      </Heading>

      <Input
        placeholder="제목, 내용 또는 기종명으로 검색"
        value={keyword}
        onChange={handleSearch}
        mb={6}
        size="lg"
        borderRadius="md"
        borderColor="gray.300"
        _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
      />

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Center>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : filtered.length === 0 ? (
        <Text textAlign="center" py={10} fontSize="lg" color="gray.500">
          검색 결과가 없습니다.
        </Text>
      ) : (
        <>
          <Table variant="simple" size="md">
            <Thead bg="teal.500"> {/* 헤더 색상 변경 */}
              <Tr>
                <Th color="white" fontSize="md">번호</Th>
                <Th color="white" fontSize="md">제목 및 내용</Th> {/* 컬럼명 변경 및 이미지 제거 */}
                <Th color="white" fontSize="md">안전사고구분</Th>
                <Th color="white" fontSize="md">기종명</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map((item, index) => (
                <Tr
                  key={item.cntntsNo}
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                  transition="background-color 0.2s"
                >
                  <Td fontWeight="medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                  <Td>
                    <Text fontWeight="semibold" fontSize="md" color="teal.600" mb={1}>
                      {item.cntntsSj}
                    </Text>
                    <Text fontSize="sm" color="gray.700" noOfLines={3}> {/* 내용 미리보기 */}
                      {item.cn}
                    </Text>
                  </Td>
                  <Td>{item.safeacdntSeNm}</Td>
                  <Td>{item.knmcNm}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <HStack justify="center" mt={8} spacing={2}>
            <Button
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage === 1}
              variant="outline"
              colorScheme="teal"
            >
              ≪ 맨 앞
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => p - 1)}
              isDisabled={currentPage === 1}
              variant="outline"
              colorScheme="teal"
            >
              이전
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (pageNum) =>
                  pageNum >= currentPage - 2 && pageNum <= currentPage + 2 // 현재 페이지를 중심으로 5개만
              )
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  colorScheme={pageNum === currentPage ? 'teal' : 'gray'}
                  variant={pageNum === currentPage ? 'solid' : 'ghost'}
                  fontWeight={pageNum === currentPage ? 'bold' : 'normal'}
                >
                  {pageNum}
                </Button>
              ))}

            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              isDisabled={currentPage === totalPages}
              variant="outline"
              colorScheme="teal"
            >
              다음
            </Button>
            <Button
              onClick={() => setCurrentPage(totalPages)}
              isDisabled={currentPage === totalPages}
              variant="outline"
              colorScheme="teal"
            >
              맨 뒤 ≫
            </Button>
          </HStack>
        </>
      )}
    </Box>
  );
}
