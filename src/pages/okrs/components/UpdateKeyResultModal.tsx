import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useGlobalToast } from '../../../hooks/useGlobalToast';
import type { KeyResultResponse, UpdateKeyResultDto, KeyResultType } from '../../../types/okrs';
import OKRService from '../../../services/OKRService';

interface UpdateKeyResultModalProps {
  keyResult: KeyResultResponse;
  onClose: () => void;
  onUpdate: () => void;
}

const UpdateKeyResultModal: React.FC<UpdateKeyResultModalProps> = ({
  keyResult,
  onClose,
  onUpdate
}) => {
  const [currentValue, setCurrentValue] = useState(keyResult.currentValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useGlobalToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData: UpdateKeyResultDto = {
        currentValue: currentValue,
      };
      
      console.log('🔄 Atualizando Key Result:', keyResult.id);
      console.log('📊 Dados enviados:', updateData);
      console.log('📈 Valor anterior:', keyResult.currentValue);
      console.log('📈 Novo valor:', currentValue);
      
      const response = await OKRService.updateKeyResult(keyResult.id, updateData);
      console.log('✅ Resposta da API:', response);
      console.log('🔄 Status anterior:', keyResult.status);
      console.log('🔄 Novo status:', response.status);
      console.log('📊 Progresso calculado:', response.progress);
      
      toast.success('Progresso atualizado!', `Key Result "${keyResult.title}" foi atualizado para ${currentValue}${keyResult.unit || ''}.`);
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('❌ Erro na atualização:', err);
      const errorMessage = err.message || 'Erro ao atualizar key result';
      setError(errorMessage);
      toast.error('Erro ao atualizar progresso', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getValueLabel = () => {
    switch (keyResult.type) {
      case 'PERCENTAGE':
        return '%';
      case 'BINARY':
        return 'Complete (1) ou Pendente (0)';
      default:
        return keyResult.unit || '';
    }
  };

  const getMaxValue = () => {
    return keyResult.type === 'PERCENTAGE' ? 100 : undefined;
  };

  const getStep = () => {
    return keyResult.type === 'BINARY' ? 1 : 0.01;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Atualizar Progresso</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">{keyResult.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Meta: 100%
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Atual
            </label>
            <div className="relative">
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                step={getStep()}
                min="0"
                max={getMaxValue()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#085F60] focus:border-transparent"
                required
              />
              {getValueLabel() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {getValueLabel()}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#085F60] text-white px-4 py-2 rounded-lg hover:bg-[#064247] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateKeyResultModal; 