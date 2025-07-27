import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react'; // ✅ ChakraProvider 임포트 추가

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider> {/* ✅ ChakraProvider로 감싸줌 */}
      <App />
    </ChakraProvider>
  </React.StrictMode>
);



