import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainPage from './pages/main/MainPage';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import FindIdPage from './pages/user/FindIdPage';
import FindPasswordPage from './pages/user/FindPasswordPage';
import ResetPasswordPage from './pages/user/ResetPasswordPage';
import ChatPage from './pages/chat/ChatPage';
import BoardCreatePage from './pages/board/BoardCreatePage';
import BoardListPage from './pages/board/BoardListPage';
import BoardDetailPage from './pages/board/BoardDetailPage';
import BoardEditPage from './pages/board/BoardEditPage';
import MyPage from './pages/mypage/MyPage';
import RentalMapPage from './pages/map/RentalMap';
import AgriPurchasePage from './pages/agrPurchase/AgriPurchasePage';
import SafetyPage from './pages/agriSafety/SafetyPage';
import PrivateRoute from './components/PrivateRoute';
import TermsPage from './pages/terms/TermsPage';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/agri-safety" element={<SafetyPage />} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/board" element={<BoardListPage />} />  
        <Route path="/board/create" element={<PrivateRoute><BoardCreatePage /></PrivateRoute>} />
        <Route path="/board/:boardId" element={<BoardDetailPage />} /> 
        <Route path="/board/edit/:boardId" element={<PrivateRoute><BoardEditPage /></PrivateRoute>} />
        <Route path="/rental-map" element={<PrivateRoute><RentalMapPage /></PrivateRoute>} />
        <Route path="/agri-purchase" element={<PrivateRoute><AgriPurchasePage /></PrivateRoute>} />
        <Route path="/boardList" element={<BoardListPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
