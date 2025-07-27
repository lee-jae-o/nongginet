import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Image,
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
  useDisclosure,
  Center, // Center 추가
  Alert, AlertIcon, // Alert 추가
} from '@chakra-ui/react';
import AgriAccidentDetailModal from './AgriAccidentDetailModal';

const ITEMS_PER_PAGE = 10;

const fallbackList = [
  'https://source.unsplash.com/100x100/?tractor',
  'https://source.unsplash.com/100x100/?accident',
  'https://source.unsplash.com/100x100/?farm',
  'https://source.unsplash.com/100x100/?warning',
];

const getImageSrc = (item) => {
  if (item.imgUrl) return item.imgUrl;
  return fallbackList[Math.floor(Math.random() * fallbackList.length)];
};

export default function AgriAccidentTab() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/agri-accident/list');
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
        console.error('Error fetching agri accident list:', err);
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
        (item.knmcCodeNm && item.knmcCodeNm.toLowerCase().includes(lower)) ||
        (item.safeAcdntSeCodeNm && item.safeAcdntSeCodeNm.toLowerCase().includes(lower))
    );
    setFiltered(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenDetail = async (cntntsNo) => {
    setSelectedItem(null); // 로딩 전 초기화
    try {
      const res = await fetch(`/api/agri-accident/detail/${cntntsNo}`);
      if (!res.ok) {
        throw new Error(`상세 데이터 로드 실패: ${res.status}`);
      }
      const json = await res.json();
      setSelectedItem(json.item);
      onOpen();
    } catch (err) {
      console.error('Error fetching detail:', err);
      // 토스트 메시지 등 사용자에게 오류 알림 추가 가능
    }
  };

  return (
    <Box p={5} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="lg" textAlign="center" mb={6} color="teal.700">
        농업기계 사고사례
      </Heading>

      <Input
        placeholder="제목, 기종명 또는 사고유형으로 검색"
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
            <Thead bg="teal.500">
              <Tr>
                <Th color="white" fontSize="md">번호</Th>
                <Th color="white" fontSize="md">이미지</Th>
                <Th color="white" fontSize="md">제목</Th>
                <Th color="white" fontSize="md">기종명</Th>
                <Th color="white" fontSize="md">사고유형</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.map((item, index) => (
                <Tr
                  key={item.cntntsNo}
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td fontWeight="medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                  <Td>
                    <Image
                      src={getImageSrc(item)}
                      alt={item.cntntsSj}
                      boxSize="80px" // 이미지 크기 조정
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    />
                  </Td>
                  <Td>
                    <Button
                      variant="link"
                      colorScheme="teal"
                      onClick={() => handleOpenDetail(item.cntntsNo)}
                      fontSize="md"
                      fontWeight="semibold"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {item.cntntsSj}
                    </Button>
                  </Td>
                  <Td>{item.knmcCodeNm}</Td>
                  <Td>{item.safeAcdntSeCodeNm}</Td>
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
              .filter((pageNum) => pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
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

          <AgriAccidentDetailModal isOpen={isOpen} onClose={onClose} item={selectedItem} />
        </>
      )}
    </Box>
  );
}