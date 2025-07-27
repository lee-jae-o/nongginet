import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
  Text,
  Button,
  VStack,
  Spinner, // 로딩 스피너 추가 (데이터 로딩 중)
  Box,
} from '@chakra-ui/react';

export default function AgriAccidentDetailModal({ isOpen, onClose, item }) {
  // item이 null일 경우 로딩 스피너 표시
  if (!item) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>상세 정보 로딩 중</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack py={10}>
              <Spinner size="lg" color="teal.500" thickness="4px" />
              <Text mt={4}>정보를 불러오는 중입니다...</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="gray">닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside"> {/* isCentered 추가, scrollBehavior 추가 */}
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="2xl"> {/* 그림자 및 모서리 둥글게 */}
        <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={3} fontSize="2xl" fontWeight="bold" color="teal.700">
          {item.cntntsSj}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={6} pb={6}> {/* 패딩 조정 */}
          <VStack spacing={5} align="start"> {/* 간격 조정 */}
            <Image
              src={item.imgUrl || 'https://source.unsplash.com/600x400/?agriculture-accident'} // 더 큰 대체 이미지 사용
              alt={item.cntntsSj}
              borderRadius="md"
              objectFit="cover"
              maxH="350px" // 최대 높이 조정
              w="100%"
              boxShadow="sm" // 이미지에도 그림자 추가
            />
            <Box bg="gray.50" p={4} borderRadius="md" w="100%"> {/* 정보 섹션 배경 */}
              <Text fontSize="md" mb={2}><strong>기종명:</strong> <Text as="span" color="gray.700">{item.knmcCodeNm}</Text></Text>
              <Text fontSize="md"><strong>사고 유형:</strong> <Text as="span" color="gray.700">{item.safeAcdntSeCodeNm}</Text></Text>
            </Box>
            <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>개요</Text>
                <Text whiteSpace="pre-line" color="gray.800" bg="gray.50" p={4} borderRadius="md">{item.smmInfo}</Text>
            </Box>
            <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" color="teal.600" mb={2}>주의사항</Text>
                <Text whiteSpace="pre-line" color="red.700" bg="red.50" p={4} borderRadius="md" border="1px solid" borderColor="red.200">{item.atpnCn}</Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3}>
          <Button onClick={onClose} colorScheme="teal" size="lg" borderRadius="md" minW="100px">닫기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}