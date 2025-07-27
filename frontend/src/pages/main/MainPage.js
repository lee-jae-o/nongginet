import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Box,
  Heading,
  VStack,
  HStack,
  useToast,
  Center,
  Image,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Spacer,
  keyframes // keyframes 추가
} from '@chakra-ui/react';
import {
  ChatIcon,
  InfoOutlineIcon,
  ViewIcon,
  LockIcon,
  StarIcon,
  SearchIcon, 
  SettingsIcon
} from '@chakra-ui/icons';
import { FaTractor, FaShoppingCart, FaClipboardList, FaHandsHelping, FaShieldAlt, FaUser } from 'react-icons/fa'; // react-icons에서 트랙터, 쇼핑카트 등 아이콘 추가
import agriImage from '../../assets/a2.jpg'; 

// 간단한 애니메이션 정의
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

export default function MainPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const toast = useToast();

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
      startAutoLogoutTimer();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    setNickname('');
    toast({
      title: '로그아웃 되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/'); // 로그아웃 후 메인 페이지로 리다이렉트
  };

  const startAutoLogoutTimer = () => {
    // 기존 타이머가 있다면 클리어 (중복 실행 방지)
    if (window.autoLogoutTimer) {
      clearTimeout(window.autoLogoutTimer);
    }
    window.autoLogoutTimer = setTimeout(() => {
      toast({
        title: '30분 동안 활동이 없어 자동 로그아웃되었습니다.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      handleLogout();
    }, 30 * 60 * 1000); // 30분
  };

  // 사용자 활동 감지하여 타이머 리셋
  useEffect(() => {
    const resetTimer = () => {
      startAutoLogoutTimer();
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (window.autoLogoutTimer) {
        clearTimeout(window.autoLogoutTimer);
      }
    };
  }, [nickname]); // nickname이 변경될 때만 effect 재실행

  const handleProtectedRoute = (path) => {
    if (nickname) {
      navigate(path);
    } else {
      toast({
        title: '로그인이 필요합니다.',
        description: '로그인 후 이용해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top', // 토스트 메시지 위치 변경
      });
      navigate('/login'); // 로그인 페이지로 이동
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" position="relative" overflow="hidden">
      {/* 배경 이미지 */}
      <Image
        src={agriImage}
        alt="농업 배경 이미지"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        objectFit="cover"
        opacity={0.5} // 투명도 약간 증가
        zIndex={0}
        filter="blur(1px) grayscale(0.2)" // 블러 강도 증가, 흑백 필터 추가
      />
      {/* 이미지 위에 오버레이 추가 (콘텐츠 가독성 향상) */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="rgba(255, 255, 255, 0.6)" // 흰색 투명 오버레이
        zIndex={0}
      />

      {/* 상단 네비게이션 */}
      <Flex as="nav" p={5} bg="white" boxShadow="md" align="center" zIndex={1} position="relative">
        <HStack spacing={2} as={Link} to="/" _hover={{ textDecoration: 'none' }}>
            <Icon as={FaTractor} w={8} h={8} color="teal.500" />
            <Heading size="lg" color="teal.700" fontFamily="sans-serif">
                농기넷
            </Heading>
        </HStack>
        <Spacer />
        {nickname ? (
          <HStack spacing={4}>
            <Text fontWeight="semibold" fontSize="md" color="gray.700">
              <Link to="/mypage" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" colorScheme="teal" size="sm" rightIcon={<SettingsIcon />}>
                    <Text as="span" fontWeight="bold" color="teal.600">{nickname}</Text>님
                </Button>
              </Link>
            </Text>
            <Button colorScheme="red" size="sm" onClick={handleLogout} boxShadow="md">
              로그아웃
            </Button>
          </HStack>
        ) : (
          <HStack spacing={3}>
            <Link to="/login">
              <Button colorScheme="teal" variant="outline" size="sm" boxShadow="md">
                로그인
              </Button>
            </Link>
            <Link to="/register">
              <Button colorScheme="teal" variant="solid" size="sm" boxShadow="md">
                회원가입
              </Button>
            </Link>
          </HStack>
        )}
      </Flex>

      {/* Hero 섹션 */}
      <VStack py={20} px={6} textAlign="center" position="relative" zIndex={1} spacing={5}
        animation={`${float} 3s ease-in-out infinite`} // 애니메이션 적용
      >
        <Heading size="3xl" mb={2} color="teal.800" fontWeight="extrabold">
          농기계, <Text as="span" color="blue.600">더 쉽게</Text> 알아보고 활용하자!
        </Heading>
        <Text fontSize={{ base: "lg", md: "xl" }} color="gray.700" maxW="700px">
          농업인의 농기계 임대·구매·안전 관리를 돕는 AI 기반 통합 플랫폼입니다.
        </Text>
        <Button
            colorScheme="blue"
            size="lg"
            mt={4}
            rightIcon={<ChatIcon />}
            boxShadow="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
            onClick={() => handleProtectedRoute('/chat')}
        >
            농기계 임대 AI 상담 시작하기
        </Button>
      </VStack>

      {/* 서비스 소개 및 버튼 섹션 */}
      <Center pb={20} zIndex={1} position="relative">
        <Box width="100%" maxW="960px" px={6}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {/* 농기계 임대 지도 */}
            <Button
              height="150px"
              variant="outline"
              colorScheme="green"
              leftIcon={<Icon as={FaTractor} w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'green.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              onClick={() => handleProtectedRoute('/rental-map')}
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>농기계 임대 지도</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>가까운 임대사업소 찾기</Text>
            </Button>

            {/* 농기계 구매정보 조회 */}
            <Button
              height="150px"
              variant="outline"
              colorScheme="orange"
              leftIcon={<Icon as={FaShoppingCart} w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'orange.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              onClick={() => handleProtectedRoute('/agri-purchase')}
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>농기계 구매 정보</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>다양한 농기계 검색 및 비교</Text>
            </Button>

            {/* 농기계 안전 */}
            <Button
              height="150px"
              variant="outline"
              colorScheme="purple"
              leftIcon={<Icon as={FaShieldAlt} w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'purple.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              onClick={() => navigate('/agri-safety')}
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>농기계 안전</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>안전 수칙 및 사고 예방 가이드</Text>
            </Button>

            {/* 게시글 목록 보기 */}
            <Button
              height="150px"
              variant="outline"
              colorScheme="blue"
              leftIcon={<ChatIcon w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'blue.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              // onClick={() => handleProtectedRoute('/board')}
              onClick={() => navigate('/board')}
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>커뮤니티 게시판</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>정보 공유 및 소통</Text>
            </Button>
            
            {/* 마이페이지 */}
            <Button
              height="150px"
              variant="outline"
              colorScheme="teal"
              leftIcon={<FaUser w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'teal.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              onClick={() => handleProtectedRoute('/mypage')}
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>마이페이지</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>내 정보 및 활동 확인</Text>
            </Button>

            <Button
              height="150px"
              variant="outline"
              colorScheme="green"
              // leftIcon={<InfoOutlineIcon w={7} h={7} />}
              leftIcon={<SearchIcon w={7} h={7} />}
              fontSize="xl"
              fontWeight="bold"
              boxShadow="lg"
              _hover={{ bg: 'green.50', transform: 'translateY(-3px)', boxShadow: '2xl' }}
              onClick={() => navigate('/terms')}  // ← 용어 검색 페이지로 이동
              p={4}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Text>용어 검색</Text>
              <Text fontSize="sm" fontWeight="normal" mt={1}>농기계 및 농업 용어 확인</Text>
            </Button>

          </SimpleGrid>
        </Box>
      </Center>
    </Box>
  );
}
