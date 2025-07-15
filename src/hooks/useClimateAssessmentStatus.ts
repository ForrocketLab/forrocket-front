import { useState, useEffect } from 'react';
import ClimateService from '../services/ClimateService';

export const useClimateAssessmentStatus = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('🔍 useClimateAssessmentStatus: Verificando status da avaliação de clima...');
        const config = await ClimateService.getClimateAssessmentConfig();
        console.log('🔍 useClimateAssessmentStatus: Config recebida:', config);
        setIsActive(config?.isActive || false);
        console.log('🔍 useClimateAssessmentStatus: isActive definido como:', config?.isActive || false);
      } catch (error) {
        console.error('❌ useClimateAssessmentStatus: Erro ao verificar status da avaliação de clima:', error);
        setIsActive(false);
      } finally {
        setIsLoading(false);
        console.log('🔍 useClimateAssessmentStatus: Loading finalizado');
      }
    };

    checkStatus();
  }, []);

  console.log('🔍 useClimateAssessmentStatus: Retornando isActive:', isActive, 'isLoading:', isLoading);

  return { isActive, isLoading };
}; 