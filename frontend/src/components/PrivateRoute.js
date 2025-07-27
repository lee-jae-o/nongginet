import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Flex, useToast } from '@chakra-ui/react';

const PrivateRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: '로그인이 필요합니다.', status: 'warning' });
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/user/mypage', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          throw new Error('401 Unauthorized');
        }
      } catch (err) {
        toast({ title: '인증 실패', status: 'error' });
        navigate('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isChecking) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return isAuthenticated ? children : null;
};

export default PrivateRoute;
