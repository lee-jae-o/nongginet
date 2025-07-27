import React from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text, Flex } from '@chakra-ui/react';
import SafetyGuideTab from './SafetyGuideTab';
import AgriAccidentTab from './AgriAccidentTab';
import QuizTab from './QuizTab';

const SafetyPage = () => {
  return (
    <Box p={{ base: 4, md: 8 }} maxWidth="1200px" mx="auto" bg="white" borderRadius="lg" boxShadow="xl" mt={8} mb={8}>
      <Flex direction="column" align="center" mb={6}>
        <Heading as="h1" size="xl" mb={2} color="teal.600">
          농기계 안전 정보
        </Heading>
        <Text fontSize="lg" color="gray.600">
          농업 활동에 필요한 안전 지침, 사고 사례 및 안전 퀴즈를 확인하세요.
        </Text>
      </Flex>

      <Tabs isFitted variant="enclosed" colorScheme="teal" mt={4}>
        <TabList mb="1em" borderBottom="2px solid" borderColor="gray.200">
          <Tab
            _selected={{ color: 'white', bg: 'teal.500', borderBottomColor: 'teal.500' }}
            _hover={{ bg: 'teal.100', color: 'teal.700' }}
            fontWeight="bold"
            fontSize="lg"
            py={3}
          >
            농기계 안전이용 지침
          </Tab>
          <Tab
            _selected={{ color: 'white', bg: 'teal.500', borderBottomColor: 'teal.500' }}
            _hover={{ bg: 'teal.100', color: 'teal.700' }}
            fontWeight="bold"
            fontSize="lg"
            py={3}
          >
            농업기계 사고사례
          </Tab>
          <Tab
            _selected={{ color: 'white', bg: 'teal.500', borderBottomColor: 'teal.500' }}
            _hover={{ bg: 'teal.100', color: 'teal.700' }}
            fontWeight="bold"
            fontSize="lg"
            py={3}
          >
            퀴즈
          </Tab>
        </TabList>

        <TabPanels p={4} bg="gray.50" borderRadius="md" boxShadow="inner">
          <TabPanel>
            <SafetyGuideTab />
          </TabPanel>
          <TabPanel>
            <AgriAccidentTab />
          </TabPanel>
          <TabPanel>
            <QuizTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SafetyPage;