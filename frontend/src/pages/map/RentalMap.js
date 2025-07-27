import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Checkbox, CheckboxGroup, Spinner, VStack, Text,
    Input, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button,
    Flex, Wrap, WrapItem, Heading, Divider, useToast,
    InputGroup, InputLeftElement,
    HStack, Icon
} from '@chakra-ui/react';
import { FaMapMarkedAlt, FaSearch, FaHeart, FaRegHeart, FaPhone, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import {
    FaTractor, FaSeedling, FaWater, FaToolbox, FaMound, FaCarrot, FaGear, FaTruckField
} from 'react-icons/fa6';

export default function RentalMap() {
    const [allMarkers, setAllMarkers] = useState([]);
    const [filteredMarkers, setFilteredMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [geocoder, setGeocoder] = useState(null);
    const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    const mapRef = useRef(null);
    const clustererRef = useRef(null);

    // 새롭게 추가: filteredMarkers의 최신 상태를 참조할 수 있도록 useRef 추가
    const filteredMarkersRef = useRef([]);

    const kakaoApiKey = process.env.REACT_APP_KAKAO_API_KEY;
    const navigate = useNavigate();
    const toast = useToast();
    const token = localStorage.getItem('token');
    const goHome = () => navigate('/');

    const machineTypes = [
        { key: 'tractor', label: '트랙터', icon: <FaTractor /> },
        { key: 'cultivator', label: '경운기', icon: <FaMound /> },
        { key: 'manager', label: '관리기', icon: <FaToolbox /> },
        { key: 'rootcrop', label: '땅속작물수확기', icon: <FaCarrot /> },
        { key: 'thresher', label: '탈곡기', icon: <FaGear /> },
        { key: 'seeder', label: '파종기', icon: <FaSeedling /> },
        { key: 'riceTransplanter', label: '이앙기', icon: <FaWater /> },
        { key: 'riceHarvester', label: '벼수확기', icon: <FaTruckField /> }
    ];

    // filteredMarkers 상태가 변경될 때마다 ref 업데이트
    useEffect(() => {
        filteredMarkersRef.current = filteredMarkers;
    }, [filteredMarkers]);

    // 1. 카카오맵 SDK 로드 및 초기 지도 생성 (한 번만 실행)
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false&libraries=services,clusterer`;
        script.async = true;
        script.onload = () => {
            window.kakao.maps.load(() => {
                setSdkLoaded(true);
                setGeocoder(new window.kakao.maps.services.Geocoder());

                const container = document.getElementById('map');
                const mapOptions = {
                    center: new window.kakao.maps.LatLng(36.5, 127.8),
                    level: 13,
                };
                const map = new window.kakao.maps.Map(container, mapOptions);
                mapRef.current = map;

                clustererRef.current = new window.kakao.maps.MarkerClusterer({
                    map,
                    averageCenter: true,
                    minLevel: 10,
                    gridSize: 100,
                    calculator: [10, 30, 50],
                    styles: [{
                        width: '50px', height: '50px', background: 'rgba(51, 153, 255, .8)', borderRadius: '25px', color: '#fff', textAlign: 'center', lineHeight: '52px', fontSize: '14px', fontWeight: 'bold', opacity: 0.9,
                    }, {
                        width: '60px', height: '60px', background: 'rgba(255, 153, 0, .8)', borderRadius: '30px', color: '#fff', textAlign: 'center', lineHeight: '62px', fontSize: '16px', fontWeight: 'bold', opacity: 0.9,
                    }, {
                        width: '70px', height: '70px', background: 'rgba(255, 51, 51, .8)', borderRadius: '35px', color: '#fff', textAlign: 'center', lineHeight: '72px', fontSize: '18px', fontWeight: 'bold', opacity: 0.9,
                    }]
                });

                // window.showMarkerDetails 함수를 전역으로 노출하고,
                // 클릭 시 filteredMarkersRef.current에서 마커를 찾도록 수정
                window.showMarkerDetails = (markerName) => {
                    const marker = filteredMarkersRef.current.find(m => m.name === markerName);
                    if (marker) {
                        setSelectedMarker(marker);
                        setIsModalOpen(true);
                    }
                };
            });
        };
        document.head.appendChild(script);

        return () => {
            delete window.showMarkerDetails;
        };

    }, [kakaoApiKey]);

    // 주소-좌표 변환 함수 (Geocoder)
    const geocodeAddress = useCallback((address, retries = 2) => {
        return new Promise((resolve) => {
            if (!geocoder) {
                resolve(null);
                return;
            }
            const attemptGeocode = (attempt) => {
                geocoder.addressSearch(address, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
                    } else if (attempt < retries) {
                        setTimeout(() => attemptGeocode(attempt + 1), 100);
                    } else {
                        console.warn(`Geocoding failed for address: ${address} after ${retries} attempts. Status: ${status}`);
                        resolve(null);
                    }
                });
            };
            attemptGeocode(0);
        });
    }, [geocoder]);

    // 2. 초기 데이터 로딩 및 지오코딩
    useEffect(() => {
        if (sdkLoaded && geocoder) {
            fetch('/api/map/rental-locations')
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('데이터를 불러오는데 실패했습니다.');
                    }
                    return res.json();
                })
                .then(async (data) => {
                    const needsGeocoding = data.filter(item => !item.lat || !item.lng);
                    setGeocodingProgress({ current: 0, total: needsGeocoding.length });

                    const batchSize = 5;
                    const enriched = [...data];

                    for (let i = 0; i < needsGeocoding.length; i += batchSize) {
                        const batch = needsGeocoding.slice(i, i + batchSize);
                        const geocodingPromises = batch.map(async (item) => {
                            if (item.address && item.address.trim()) {
                                const coords = await geocodeAddress(item.address);
                                if (coords) {
                                    const index = enriched.findIndex(e => e.name === item.name);
                                    if (index !== -1) {
                                        enriched[index] = { ...enriched[index], ...coords };
                                    }
                                }
                            }
                            setGeocodingProgress(prev => ({ ...prev, current: prev.current + 1 }));
                        });
                        await Promise.all(geocodingPromises);
                        if (i + batchSize < needsGeocoding.length) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    }

                    const validMarkers = enriched.filter(item => item.lat && item.lng);
                    setAllMarkers(validMarkers);
                    setFilteredMarkers(validMarkers);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("데이터 로딩 또는 지오코딩 오류:", err);
                    toast({
                        title: '데이터 로딩 실패',
                        description: err.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'top',
                    });
                    setLoading(false);
                });
        }
    }, [sdkLoaded, geocoder, geocodeAddress, toast]);

    // 3. 필터 및 검색 적용 로직 (allMarkers와 searchTerm, selectedMachines 변경 시 filteredMarkers 업데이트)
    useEffect(() => {
        let result = allMarkers;

        if (selectedMachines.length > 0) {
            result = result.filter((marker) =>
                selectedMachines.every((type) => {
                    if (type === 'other') {
                        return marker.other && marker.other.trim() !== '';
                    } else {
                        return parseInt(marker[type] || '0', 10) > 0;
                    }
                })
            );
        }

        if (searchTerm.trim()) {
            result = result.filter(marker =>
                (marker.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                (marker.address || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
        }

        setFilteredMarkers(result);
    }, [selectedMachines, searchTerm, allMarkers]);

    // 4. 지도에 마커 및 클러스터 업데이트 (filteredMarkers 변경 시)
    useEffect(() => {
        if (mapRef.current && clustererRef.current && !loading) {
            const map = mapRef.current;
            const clusterer = clustererRef.current;

            clusterer.clear();

            let openInfoWindow = null;

            const markers = filteredMarkers.map((marker) => {
                const position = new window.kakao.maps.LatLng(marker.lat, marker.lng);
                const kakaoMarker = new window.kakao.maps.Marker({ position });

                const content = `
                    <div style="padding:10px; font-size:14px; background-color:white; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); max-width:220px;">
                        <strong style="display:block; margin-bottom:5px; color:#2D3748; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:16px;">
                            ${marker.name}
                        </strong>
                        <div style="color:#4A5568; margin-bottom:8px; font-size:13px;">${marker.address}</div>
                        <button onclick="window.showMarkerDetails('${marker.name}')"
                            style="width:100%; padding:8px 12px; background-color:#3182CE; color:white; border:none; border-radius:4px; cursor:pointer; font-size:14px; font-weight:bold; transition:background-color 0.2s ease-in-out;">
                            상세 정보 보기
                        </button>
                    </div>
                `;
                const infowindow = new window.kakao.maps.InfoWindow({ content: content, removable: true });

                window.kakao.maps.event.addListener(kakaoMarker, 'click', () => {
                    if (openInfoWindow) openInfoWindow.close();
                    infowindow.open(map, kakaoMarker);
                    openInfoWindow = infowindow;
                });

                return kakaoMarker;
            });

            clusterer.addMarkers(markers);

            if (filteredMarkers.length > 0) {
                const bounds = new window.kakao.maps.LatLngBounds();
                filteredMarkers.forEach(marker => {
                    bounds.extend(new window.kakao.maps.LatLng(marker.lat, marker.lng));
                });
                map.setBounds(bounds);
            }
        }
    }, [loading, filteredMarkers]);

    useEffect(() => {
        if (selectedMarker && token) {
            fetch(`/api/favorite/list`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    const exists = data.some(
                        fav => fav.type === 'rental' && fav.item_id === selectedMarker.name
                    );
                    setIsFavorited(exists);
                })
                .catch(err => {
                    console.error("즐겨찾기 목록 불러오기 실패:", err);
                    toast({
                        title: '즐겨찾기 정보 로딩 실패',
                        description: '즐겨찾기 상태를 불러오는데 문제가 발생했습니다.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top',
                    });
                });
        }
    }, [selectedMarker, token, toast]);

    const handleFavoriteToggle = async () => {
        if (!token) {
            toast({
                title: '로그인이 필요합니다.',
                description: '즐겨찾기 기능을 이용하려면 로그인해주세요.',
                status: 'info',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            navigate('/login');
            return;
        }
        if (!selectedMarker) return;

        try {
            if (isFavorited) {
                const res = await fetch(`/api/favorite/remove/rental/${selectedMarker.name}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('즐겨찾기 취소 실패');
                setIsFavorited(false);
                toast({
                    title: '즐겨찾기 취소 완료',
                    status: 'success',
                    duration: 1500,
                    isClosable: true,
                    position: 'top',
                });
            } else {
                const res = await fetch(`/api/favorite/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        type: 'rental',
                        item_id: selectedMarker.name,
                        item_name: selectedMarker.name,
                        address: selectedMarker.address,
                    }),
                });
                if (!res.ok) throw new Error('즐겨찾기 추가 실패');
                setIsFavorited(true);
                toast({
                    title: '즐겨찾기 추가 완료',
                    status: 'success',
                    duration: 1500,
                    isClosable: true,
                    position: 'top',
                });
            }
        } catch (err) {
            console.error("즐겨찾기 토글 오류:", err);
            toast({
                title: '오류 발생',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        }
    };

    return (
        <Flex h="100vh" overflow="hidden">
            {/* 왼쪽 사이드바 */}
            <Box
                w={{ base: "100%", md: "360px" }}
                p={6}
                bg="white"
                borderRight={{ base: "none", md: "1px solid #e2e8f0" }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="100vh"
                overflowY="auto"
                boxShadow={{ base: "lg", md: "none" }}
                zIndex="2"
            >
                <Box>
                    <HStack mb={6} spacing={3} alignItems="center" justifyContent="flex-start">
                        <Icon as={FaMapMarkedAlt} w={8} h={8} color="teal.500" />
                        <Heading fontSize="2xl" color="teal.700" fontWeight="bold">농기계 임대소 지도</Heading>
                    </HStack>

                    <VStack align="stretch" spacing={4} mb={6}>
                        <InputGroup size="lg">
                            <InputLeftElement
                                pointerEvents="none"
                                children={<FaSearch color="gray.300" />}
                            />
                            <Input
                                placeholder="사업소명 또는 주소 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                variant="filled"
                                borderRadius="md"
                            />
                        </InputGroup>

                        <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>
                            기계 종류 필터링:
                        </Text>
                        <CheckboxGroup colorScheme="teal" value={selectedMachines} onChange={setSelectedMachines}>
                            <Wrap spacing={3} justify="flex-start">
                                {machineTypes.map((type) => (
                                    <WrapItem key={type.key}>
                                        <Checkbox value={type.key} size="md">
                                            <Flex align="center">
                                                <Box as="span" mr={1}>{type.icon}</Box> {type.label}
                                            </Flex>
                                        </Checkbox>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </CheckboxGroup>

                        <Divider my={4} />

                        <Box>
                            <Text fontSize="sm" color="gray.600">
                                총 사업소: <Text as="span" fontWeight="bold">{allMarkers.length}</Text>개
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                필터 적용: <Text as="span" fontWeight="bold">{filteredMarkers.length}</Text>개
                            </Text>
                            {loading && (
                                <HStack mt={2}>
                                    <Spinner size="sm" color="blue.500" />
                                    <Text fontSize="sm" color="blue.600">
                                        {geocodingProgress.total > 0
                                            ? `주소 변환 중... (${geocodingProgress.current}/${geocodingProgress.total})`
                                            : '데이터 로딩 중...'}
                                    </Text>
                                </HStack>
                            )}
                        </Box>
                    </VStack>
                </Box>

                <Box mt={6}>
                    <Button
                        onClick={goHome}
                        colorScheme="blue"
                        leftIcon={<Icon as={FaHome} />}
                        width="100%"
                        variant="solid"
                        size="lg"
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                    >
                        홈으로
                    </Button>
                </Box>
            </Box>

            {/* 지도 영역 */}
            <Box flex="1" id="map" height="100%" zIndex="1" />

            {/* 마커 상세 정보 모달 */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered size="lg">
                <ModalOverlay />
                <ModalContent borderRadius="xl" boxShadow="xl">
                    <ModalHeader
                        bg="teal.500"
                        color="white"
                        borderTopRadius="xl"
                        pb={3}
                        pt={4}
                        fontSize="2xl"
                        fontWeight="bold"
                    >
                        {selectedMarker?.name}
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody px={6} py={5}>
                        <VStack align="start" spacing={3}>
                            <Text fontSize="md">
                                <Icon as={FaPhone} mr={2} color="gray.600" />
                                <b>전화번호:</b> {selectedMarker?.phone || '정보 없음'}
                            </Text>
                            <Text fontSize="md">
                                <Icon as={FaMapMarkerAlt} mr={2} color="gray.600" />
                                <b>도로명주소:</b> {selectedMarker?.address || '정보 없음'}
                            </Text>
                            <Text fontSize="md">
                                <Icon as={FaHome} mr={2} color="gray.600" />
                                <b>지번주소:</b> {selectedMarker?.jibun || '정보 없음'}
                            </Text>
                            <Divider my={3} borderColor="gray.300" />
                            <Heading size="md" color="teal.600" mb={2}>보유 농기계 현황</Heading>
                            <Wrap spacing={4} width="100%">
                                {machineTypes.map((type) => (
                                    <WrapItem key={type.key} width={{ base: "48%", sm: "30%" }}>
                                        <Text fontSize="sm" color="gray.700">
                                            <Flex align="center">
                                                <Box as="span" mr={1}>{type.icon}</Box>
                                                <b>{type.label}:</b> {selectedMarker?.[type.key] || '0'}대
                                            </Flex>
                                        </Text>
                                    </WrapItem>
                                ))}
                                {selectedMarker?.other && selectedMarker.other.trim() !== '' && (
                                    <WrapItem width="100%">
                                        <Text fontSize="sm" color="gray.700">
                                            <Flex align="center">
                                                <Box as="span" mr={1}><Icon as={FaGear} /></Box>
                                                <b>기타:</b> {selectedMarker?.other}
                                            </Flex>
                                        </Text>
                                    </WrapItem>
                                )}
                            </Wrap>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderBottomRadius="xl" pt={4} pb={4}>
                        <Button
                            onClick={handleFavoriteToggle}
                            colorScheme={isFavorited ? 'red' : 'teal'}
                            leftIcon={isFavorited ? <Icon as={FaHeart} /> : <Icon as={FaRegHeart} />}
                            mr={3}
                            size="md"
                            boxShadow="sm"
                        >
                            {isFavorited ? '즐겨찾기 취소' : '즐겨찾기 추가'}
                        </Button>
                        <Button onClick={() => setIsModalOpen(false)} colorScheme="gray" size="md">닫기</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}