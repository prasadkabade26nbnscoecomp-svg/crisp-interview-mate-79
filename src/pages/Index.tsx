import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to HomePage - this is just a fallback route
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
