import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Input, Text, VStack, HStack, useToast, Heading, Divider, Icon,
  List, ListItem, ListIcon, Flex, IconButton, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Spinner, Tabs, TabList, TabPanels, Tab, TabPanel, Badge, Card, CardBody,
  Grid, GridItem,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { MdPushPin, MdArticle, MdComment, MdPerson, MdEmail, MdCalendarMonth } from 'react-icons/md'; // 아이콘 추가

export default function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [editingNickname, setEditingNickname] = useState(false); // 닉네임 수정 모드
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // 회원 탈퇴 확인 필드 모드
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favorites2, setFavorites2] = useState([]);
  const [isNicknameDuplicate, setIsNicknameDuplicate] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [myStats, setMyStats] = useState({ post_count: 0, comment_count: 0 });
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const cancelRef = useState(null)[0];
  const toast = useToast();

  useEffect(() => {
    fetchUserInfo();
    fetchFavorites();
    fetchFavorites2();
    fetchMyStats();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/user/mypage', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await res.json();
      setUserInfo(data);
      setNickname(data.nickname);
    } catch (err) {
      toast({ title: '사용자 정보 조회 실패', description: err.message, status: 'error' });
      navigate('/login'); // 로그인 페이지로 리다이렉트
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorite/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.error('즐겨찾기 1 조회 실패:', err);
    }
  };

  const fetchFavorites2 = async () => {
    try {
      const res = await fetch('/api/favorite2/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setFavorites2(data);
    } catch (err) {
      console.error('즐겨찾기 2 조회 실패:', err);
    }
  };

  const fetchMyStats = async () => {
    try {
      const res = await fetch('/api/user/my-stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyStats(data);
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  };

  const fetchMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/user/my-posts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyPosts(data);
    } catch (err) {
      toast({ title: '게시글 조회 실패', status: 'error' });
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchMyComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch('/api/user/my-comments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyComments(data);
    } catch (err) {
      toast({ title: '댓글 조회 실패', status: 'error' });
    } finally {
      setLoadingComments(false);
    }
  };

  const goToPost = (postId) => navigate(`/board/${postId}`);
  const goToPostFromComment = (boardId) => navigate(`/board/${boardId}`);

  const checkNickname = async () => {
    if (!nickname) {
      toast({ title: '닉네임을 입력해주세요.', status: 'warning' });
      return;
    }
    if (userInfo && nickname === userInfo.nickname) { // userInfo가 null이 아닐 때만 비교
        setIsNicknameDuplicate(false);
        toast({ title: '현재 닉네임과 동일합니다.', status: 'info' });
        return;
    }

    setCheckingNickname(true);
    try {
      const res = await fetch('/api/user/check-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      if (res.status === 409) {
        setIsNicknameDuplicate(true);
        toast({ title: '이미 존재하는 닉네임입니다.', status: 'error' });
      } else if (res.ok) {
        setIsNicknameDuplicate(false);
        toast({ title: '사용 가능한 닉네임입니다.', status: 'success' });
      } else {
          throw new Error('닉네임 중복 확인 중 오류가 발생했습니다.');
      }
    } catch (err) {
      toast({ title: '닉네임 중복 확인 실패', description: err.message, status: 'error' });
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleUpdate = async () => {
    if (userInfo && nickname === userInfo.nickname) { // userInfo가 null이 아닐 때만 비교
        toast({ title: '현재 닉네임과 동일하여 수정할 수 없습니다.', status: 'info' });
        setEditingNickname(false);
        return;
    }
    if (isNicknameDuplicate) {
      toast({ title: '중복된 닉네임은 사용할 수 없습니다.', status: 'error' });
      return;
    }
    if (!nickname) {
        toast({ title: '닉네임을 입력해주세요.', status: 'warning' });
        return;
    }

    const res = await fetch('/api/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ nickname })
    });
    if (res.ok) {
      localStorage.setItem('nickname', nickname);
      toast({ title: '닉네임이 수정되었습니다.', status: 'success' });
      setEditingNickname(false);
      fetchUserInfo();
    } else {
        toast({ title: '닉네임 수정 실패', status: 'error' });
    }
  };

  const handleDeleteClick = () => {
    setEditingNickname(false); // 닉네임 수정 모드 비활성화
    setShowDeleteConfirmation(true); // 회원 탈퇴 확인 필드 표시
  };

  const confirmDelete = async () => {
    if (!password) {
      toast({ title: '비밀번호를 입력해주세요.', status: 'warning' });
      return;
    }

    const res = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ password })
    });
    setIsAlertOpen(false); // 알림창 닫기
    setShowDeleteConfirmation(false); // 비밀번호 입력 필드 숨기기

    if (res.ok) {
      toast({ title: '회원 탈퇴가 완료되었습니다.', status: 'info' });
      localStorage.clear();
      window.location.href = '/'; // 전체 페이지 새로고침하여 로그인 페이지로 이동
    } else {
      toast({ title: '비밀번호가 틀렸습니다.', status: 'error' });
    }
  };

  // 탭 변경 핸들러 추가
  const handleTabChange = (index) => {
    if (index === 1 && myPosts.length === 0 && !loadingPosts) { // '내 게시글' 탭 (인덱스 1)
      fetchMyPosts();
    } else if (index === 2 && myComments.length === 0 && !loadingComments) { // '내 댓글' 탭 (인덱스 2)
      fetchMyComments();
    }
  };


  if (!userInfo) return (
    <Flex justify="center" align="center" minH="80vh">
      <Spinner size="xl" color="blue.500" />
    </Flex>
  );

  return (
    <Box maxW="900px" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="xl" bg="white">
      <Heading size="xl" mb={6} textAlign="center" color="blue.700">마이페이지</Heading>

      <Flex justify="center" mb={8} gap={4}>
        <Badge p={3} borderRadius="md" colorScheme="blue" fontSize="md" display="flex" alignItems="center" gap={2} boxShadow="sm">
          <Icon as={MdArticle} w={5} h={5} />
          <Text>게시글 {myStats.post_count}</Text>
        </Badge>
        <Badge p={3} borderRadius="md" colorScheme="green" fontSize="md" display="flex" alignItems="center" gap={2} boxShadow="sm">
          <Icon as={MdComment} w={5} h={5} />
          <Text>댓글 {myStats.comment_count}</Text>
        </Badge>
      </Flex>

      <Box p={6} bg="gray.50" borderRadius="md" boxShadow="md" mb={8}>
        <Heading size="md" mb={4} color="gray.700">내 정보</Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={4}>
          <GridItem>
            <HStack spacing={2} alignItems="center">
              <Icon as={MdPerson} color="gray.600" />
              <Text fontSize="md"><strong>아이디:</strong> {userInfo.username}</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={2} alignItems="center">
              <Icon as={MdPerson} color="gray.600" />
              <Text fontSize="md"><strong>이름:</strong> {userInfo.name}</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={2} alignItems="center">
              <Icon as={MdEmail} color="gray.600" />
              <Text fontSize="md"><strong>이메일:</strong> {userInfo.email}</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={2} alignItems="center">
              <Icon as={MdPerson} color="gray.600" />
              <Text fontSize="md"><strong>닉네임:</strong> {userInfo.nickname}</Text>
            </HStack>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <HStack spacing={2} alignItems="center">
              <Icon as={MdCalendarMonth} color="gray.600" />
              <Text fontSize="md"><strong>가입일:</strong> {userInfo.created_at?.slice(0, 10)}</Text>
            </HStack>
          </GridItem>
        </Grid>

        <HStack mt={6} spacing={4} justify="flex-end">
          {!editingNickname && !showDeleteConfirmation && (
            <>
              <Button colorScheme="blue" leftIcon={<EditIcon />} onClick={() => { setEditingNickname(true); setShowDeleteConfirmation(false); }}>닉네임 수정</Button>
              <Button colorScheme="red" leftIcon={<DeleteIcon />} onClick={handleDeleteClick}>
                회원 탈퇴
              </Button>
            </>
          )}
        </HStack>

        {editingNickname && (
          <VStack spacing={3} align="stretch" mt={6} p={4} bg="white" borderRadius="md" boxShadow="inner">
            <Text fontSize="md" fontWeight="bold">새 닉네임 입력</Text>
            <HStack>
                <Input
                    placeholder="새 닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => {
                        setNickname(e.target.value);
                        setIsNicknameDuplicate(false); // 닉네임 변경 시 중복 상태 초기화
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                    }}
                />
                <Button colorScheme="teal" onClick={checkNickname} isLoading={checkingNickname} flexShrink={0}>중복 확인</Button>
            </HStack>
            <HStack justify="flex-end">
              <Button leftIcon={<CheckIcon />} colorScheme="green" onClick={handleUpdate}>수정 완료</Button>
              <Button leftIcon={<CloseIcon />} onClick={() => setEditingNickname(false)} variant="outline">취소</Button>
            </HStack>
          </VStack>
        )}

        {showDeleteConfirmation && (
          <Box mt={6} p={4} bg="red.50" borderRadius="md" boxShadow="inner">
            <Text color="red.700" fontWeight="bold" mb={2}>회원 탈퇴를 위해 비밀번호를 입력해주세요.</Text>
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') setIsAlertOpen(true);
              }}
            />
            <HStack mt={3} justify="flex-end">
              <Button colorScheme="red" onClick={() => setIsAlertOpen(true)}>회원 탈퇴</Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirmation(false)}>취소</Button>
            </HStack>
          </Box>
        )}
      </Box>

      <Divider my={8} borderColor="gray.300" />

      <Tabs isFitted variant="enclosed" colorScheme="blue" onChange={handleTabChange}> {/* onChange 핸들러 추가 */}
        <TabList mb="1em">
          <Tab _selected={{ color: 'blue.700', bg: 'blue.50' }}>즐겨찾기</Tab>
          <Tab _selected={{ color: 'blue.700', bg: 'blue.50' }}>내 게시글</Tab> {/* onClick 제거 */}
          <Tab _selected={{ color: 'blue.700', bg: 'blue.50' }}>내 댓글</Tab> {/* onClick 제거 */}
        </TabList>

        <TabPanels>
          {/* 즐겨찾기 탭 */}
          <TabPanel p={0}>
            <VStack spacing={8} align="stretch">
                <Box p={5} borderWidth={1} borderRadius="lg" boxShadow="sm" bg="white">
                    <Heading size="md" mb={4} display="flex" alignItems="center" gap={2} color="red.600">
                        <Icon as={MdPushPin} /> 즐겨찾기한 임대사업소
                    </Heading>
                    {favorites.length > 0 ? (
                        <List spacing={3}>
                            {favorites.map((fav, i) => (
                                <ListItem key={i} p={2} bg="red.50" borderRadius="md" boxShadow="xs">
                                    <HStack alignItems="flex-start">
                                        <Icon as={MdPushPin} color="red.500" mt={1} />
                                        <Box>
                                            <Text fontWeight="bold" color="red.700">{fav.item_name}</Text>
                                            <Text fontSize="sm" color="gray.600">{fav.address}</Text>
                                        </Box>
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Text color="gray.500" py={4} textAlign="center">즐겨찾기한 임대사업소가 없습니다.</Text>
                    )}
                </Box>

                <Box p={5} borderWidth={1} borderRadius="lg" boxShadow="sm" bg="white">
                    <Heading size="md" mb={4} display="flex" alignItems="center" gap={2} color="orange.600">
                        <Icon as={MdPushPin} /> 즐겨찾기한 구매 항목
                    </Heading>
                    {favorites2.length > 0 ? (
                        <List spacing={3}>
                            {favorites2.map((item, idx) => (
                                <ListItem key={idx} p={2} bg="orange.50" borderRadius="md" boxShadow="xs">
                                    <HStack alignItems="center">
                                        <Icon as={MdPushPin} color="orange.500" />
                                        <Text fontWeight="bold" color="orange.700">{item.item_name}</Text>
                                        <Text fontSize="sm" color="gray.600">({item.manufacturer})</Text>
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Text color="gray.500" py={4} textAlign="center">즐겨찾기한 구매 항목이 없습니다.</Text>
                    )}
                </Box>
            </VStack>
          </TabPanel>

          {/* 내 게시글 탭 */}
          <TabPanel>
            {loadingPosts ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : myPosts.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {myPosts.map((post) => (
                  <Card
                    key={post.id}
                    cursor="pointer"
                    _hover={{ bg: 'blue.50', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    onClick={() => goToPost(post.id)}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="sm"
                    transition="all 0.2s ease-in-out"
                  >
                    <CardBody p={4}>
                      <Flex justify="space-between" align="flex-start">
                        <Box flex={1} pr={4}>
                          <Text fontWeight="bold" fontSize="lg" color="blue.800" mb={1} noOfLines={1}>{post.title}</Text>
                          <Text color="gray.700" fontSize="sm" mb={2} noOfLines={2}>{post.content}</Text>
                          <Text fontSize="xs" color="gray.500">{post.created_at?.slice(0, 10)}</Text>
                        </Box>
                        <HStack spacing={1} flexShrink={0} color="gray.500">
                          <Icon as={ViewIcon} w={4} h={4} />
                          <Text fontSize="sm">{post.views}</Text>
                        </HStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" py={10} textAlign="center">작성한 게시글이 없습니다.</Text>
            )}
          </TabPanel>

          {/* 내 댓글 탭 */}
          <TabPanel>
            {loadingComments ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner size="lg" color="green.500" />
              </Flex>
            ) : myComments.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {myComments.map((comment) => (
                  <Card
                    key={comment.id}
                    cursor="pointer"
                    _hover={{ bg: 'green.50', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    onClick={() => goToPostFromComment(comment.board_id)}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="sm"
                    transition="all 0.2s ease-in-out"
                  >
                    <CardBody p={4}>
                      <Text fontWeight="bold" fontSize="md" color="green.700" mb={1} noOfLines={1}>
                        <Icon as={MdComment} mr={1} w={4} h={4} />"{comment.board_title}" 게시글에 댓글
                      </Text>
                      <Text color="gray.700" mb={2} noOfLines={2}>{comment.content}</Text>
                      <Text fontSize="xs" color="gray.500">{comment.created_at?.slice(0, 10)}</Text>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" py={10} textAlign="center">작성한 댓글이 없습니다.</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* 회원탈퇴 확인 알림창 */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={() => setIsAlertOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              정말로 탈퇴하시겠습니까?
            </AlertDialogHeader>
            <AlertDialogBody>
              탈퇴 후에는 되돌릴 수 없습니다. 작성하신 모든 게시글과 댓글은 삭제됩니다. 계속 진행하시겠습니까?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                취소
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                탈퇴
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}