import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

const DashboardManager = () => {
  const { user } = useAuth();
  return <h1> Oi</h1>;
};

export default DashboardManager;