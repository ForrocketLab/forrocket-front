import { useState, useEffect } from 'react';
import { MessageSquare, X, Loader, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ClimateService from '../services/ClimateService';
import { useGlobalToast } from '../hooks/useGlobalToast';

interface ClimateAssessmentFloatingButtonProps {
  isVisible: boolean;
}

const ClimateAssessmentFloatingButton: React.FC<ClimateAssessmentFloatingButtonProps> = ({ isVisible }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [formData, setFormData] = useState({
    relacionamentoLiderancaScore: 0,
    relacionamentoLiderancaJustification: '',
    relacionamentoColegasScore: 0,
    relacionamentoColegasJustification: '',
    reconhecimentoValorizacaoScore: 0,
    reconhecimentoValorizacaoJustification: '',
    cargaTrabalhoEquilibrioScore: 0,
    cargaTrabalhoEquilibrioJustification: '',
  });
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  // Chave para localStorage
  const STORAGE_KEY = `climate_assessment_${user?.id || 'anonymous'}`;

  // Carregar dados salvos do localStorage
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (error) {
          console.error('Erro ao carregar dados salvos:', error);
        }
      }
    }
  }, [user, STORAGE_KEY]);

  // Salvar dados automaticamente no localStorage
  useEffect(() => {
    if (user) {
      const hasValidData = Object.entries(formData).some(([key, value]) => {
        if (key.includes('Score')) {
          return value !== 0;
        } else {
          return value !== '';
        }
      });
      
      if (hasValidData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      }
    }
  }, [formData, user, STORAGE_KEY]);

  // Verificar se o usuário tem permissão para ver o botão
  const hasPermission = () => {
    if (!user) {
      return false;
    }
    
    // Verificar se tem papel de colaborador ou mentor
    const eligibleRoles = ['COLLABORATOR', 'MENTOR', 'colaborador', 'mentor'];
    const leadershipRoles = ['MANAGER', 'LEADER', 'RH', 'ADMIN', 'COMMITTEE', 'gestor', 'lider', 'rh', 'admin', 'comite'];
    
    const userRoles = user.roles || [];
    
    const hasEligibleRole = userRoles.some((role: string) => {
      return eligibleRoles.includes(role);
    });
    
    const hasLeadershipRole = userRoles.some((role: string) => {
      return leadershipRoles.includes(role);
    });
    
    return hasEligibleRole && !hasLeadershipRole;
  };

  useEffect(() => {
    if (showModal && hasPermission()) {
      loadAssessment();
    }
  }, [showModal]);

  const loadAssessment = async () => {
    try {
      setIsLoading(true);
      const existingAssessment = await ClimateService.getClimateAssessment();
      if (existingAssessment) {
        setAssessment(existingAssessment);
        
        // Verificar se a avaliação já foi submetida
        if (existingAssessment.status === 'SUBMITTED') {
          setIsSubmitted(true);
        }
        
        // Preencher formulário com dados existentes
        const answers = existingAssessment.answers;
        
        const newFormData = {
          relacionamentoLiderancaScore: answers.find((a: any) => a.criterionId === 'relacionamento-lideranca')?.score || 0,
          relacionamentoLiderancaJustification: answers.find((a: any) => a.criterionId === 'relacionamento-lideranca')?.justification || '',
          relacionamentoColegasScore: answers.find((a: any) => a.criterionId === 'relacionamento-colegas')?.score || 0,
          relacionamentoColegasJustification: answers.find((a: any) => a.criterionId === 'relacionamento-colegas')?.justification || '',
          reconhecimentoValorizacaoScore: answers.find((a: any) => a.criterionId === 'reconhecimento-valorizacao')?.score || 0,
          reconhecimentoValorizacaoJustification: answers.find((a: any) => a.criterionId === 'reconhecimento-valorizacao')?.justification || '',
          cargaTrabalhoEquilibrioScore: answers.find((a: any) => a.criterionId === 'carga-trabalho-equilibrio')?.score || 0,
          cargaTrabalhoEquilibrioJustification: answers.find((a: any) => a.criterionId === 'carga-trabalho-equilibrio')?.justification || '',
        };
        
        setFormData(newFormData);
        // Salvar no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormData));
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validar se todos os campos estão preenchidos
      const requiredFields = [
        'relacionamentoLiderancaScore',
        'relacionamentoLiderancaJustification',
        'relacionamentoColegasScore',
        'relacionamentoColegasJustification',
        'reconhecimentoValorizacaoScore',
        'reconhecimentoValorizacaoJustification',
        'cargaTrabalhoEquilibrioScore',
        'cargaTrabalhoEquilibrioJustification'
      ];
      
      const missingFields = requiredFields.filter(field => {
        const value = (formData as any)[field];
        if (field.includes('Score')) {
          return value === 0 || value === undefined || value === null;
        } else {
          return value === '' || value === undefined || value === null;
        }
      });
      
      if (missingFields.length > 0) {
        console.error('❌ Campos obrigatórios não preenchidos:', missingFields);
        showErrorToast('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      if (assessment) {
        // Atualizar avaliação existente
        await ClimateService.updateClimateAssessment(formData);
        showSuccessToast('Sucesso', 'Avaliação atualizada com sucesso!');
      } else {
        // Criar nova avaliação
        await ClimateService.createClimateAssessment(formData);
        showSuccessToast('Sucesso', 'Avaliação criada com sucesso!');
      }
      
      // Limpar dados do localStorage após salvar com sucesso
      localStorage.removeItem(STORAGE_KEY);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar avaliação';
      showErrorToast('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    try {
      setIsLoading(true);
      // Se não existe avaliação, criar/atualizar antes de submeter
      if (!assessment) {
        // Validar se todos os campos estão preenchidos
        const requiredFields = [
          'relacionamentoLiderancaScore',
          'relacionamentoLiderancaJustification',
          'relacionamentoColegasScore',
          'relacionamentoColegasJustification',
          'reconhecimentoValorizacaoScore',
          'reconhecimentoValorizacaoJustification',
          'cargaTrabalhoEquilibrioScore',
          'cargaTrabalhoEquilibrioJustification'
        ];
        const missingFields = requiredFields.filter(field => {
          const value = (formData as any)[field];
          if (field.includes('Score')) {
            return value === 0 || value === undefined || value === null;
          } else {
            return value === '' || value === undefined || value === null;
          }
        });
        if (missingFields.length > 0) {
          showErrorToast('Erro', 'Por favor, preencha todos os campos obrigatórios');
          setIsLoading(false);
          return;
        }
        // Cria ou atualiza avaliação antes de submeter
        await ClimateService.createClimateAssessment(formData).catch(async (err) => {
          // Se já existe, faz update
          if (err?.response?.data?.message?.includes('Já existe uma avaliação')) {
            await ClimateService.updateClimateAssessment(formData);
          } else {
            throw err;
          }
        });
      }
      await ClimateService.submitClimateAssessment();
      showSuccessToast('Sucesso', 'Avaliação submetida com sucesso!');
      setIsSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error: any) {
      showErrorToast('Erro', error.message || 'Erro ao submeter avaliação');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle do modal
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  if (!isVisible || !hasPermission()) {
    return null;
  }

  // Lista de critérios simplificada
  const CRITERIA = [
    {
      id: 'relacionamento-lideranca',
      label: 'Relacionamento com a Liderança',
      description: 'Como você percebe o apoio, abertura e comunicação da liderança com você?'
    },
    {
      id: 'relacionamento-colegas',
      label: 'Relacionamento com Colegas',
      description: 'Como é a colaboração, respeito e clima entre você e seus colegas?'
    },
    {
      id: 'reconhecimento-valorizacao',
      label: 'Reconhecimento e Valorização',
      description: 'Você sente que seu trabalho é reconhecido e valorizado?'
    },
    {
      id: 'carga-trabalho-equilibrio',
      label: 'Carga de Trabalho e Equilíbrio',
      description: 'Como está o equilíbrio entre demandas, prazos e seu bem-estar?'
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Botão Flutuante */}
      <button
        onClick={toggleModal}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 border-2 border-white/20 backdrop-blur-sm ${
          isSubmitted 
            ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800'
            : 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800'
        } text-white`}
        title={isSubmitted ? "Avaliação de Clima - Enviada" : "Avaliação de Clima Organizacional"}
        style={{
          boxShadow: isSubmitted 
            ? '0 10px 25px -5px rgba(34, 197, 94, 0.4), 0 10px 10px -5px rgba(34, 197, 94, 0.2)'
            : '0 10px 25px -5px rgba(20, 184, 166, 0.4), 0 10px 10px -5px rgba(20, 184, 166, 0.2)',
        }}
      >
        <div className="relative">
          {showModal ? (
            <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" />
          ) : isSubmitted ? (
            <svg className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" />
          )}
          {/* Indicador de notificação */}
          {!isSubmitted && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
          )}
        </div>
      </button>

      {/* Popup de Avaliação */}
      {showModal && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              {isSubmitted ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <MessageSquare className="w-4 h-4 text-teal-600" />
              )}
              <span className="hidden sm:inline">Avaliação de Clima</span>
              <span className="sm:hidden">Clima</span>
              {isSubmitted && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Enviada
                </span>
              )}
            </h2>
            <button 
              onClick={toggleModal} 
              className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-6 h-6 animate-spin text-teal-600" />
              </div>
            ) : isSubmitted ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Avaliação Enviada!</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Sua avaliação de clima organizacional foi submetida com sucesso.</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    <strong>Status:</strong> Avaliação finalizada e enviada para análise
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-3 sm:space-y-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {CRITERIA.map(criterion => {
                  // Mapear os IDs dos critérios para as chaves corretas do formData
                  const keyMapping: { [key: string]: { score: string; justification: string } } = {
                    'relacionamento-lideranca': {
                      score: 'relacionamentoLiderancaScore',
                      justification: 'relacionamentoLiderancaJustification'
                    },
                    'relacionamento-colegas': {
                      score: 'relacionamentoColegasScore',
                      justification: 'relacionamentoColegasJustification'
                    },
                    'reconhecimento-valorizacao': {
                      score: 'reconhecimentoValorizacaoScore',
                      justification: 'reconhecimentoValorizacaoJustification'
                    },
                    'carga-trabalho-equilibrio': {
                      score: 'cargaTrabalhoEquilibrioScore',
                      justification: 'cargaTrabalhoEquilibrioJustification'
                    }
                  };
                  
                  const scoreKey = keyMapping[criterion.id].score;
                  const justificationKey = keyMapping[criterion.id].justification;
                  
                  return (
                    <div key={criterion.id} className="space-y-2 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-xs sm:text-sm truncate">{criterion.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{criterion.description}</div>
                      {/* Estrelas */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, [scoreKey]: star }));
                            }}
                            className="focus:outline-none transform hover:scale-110 transition-transform duration-150"
                          >
                            <Star
                              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${(formData as any)[scoreKey] >= star ? 'text-yellow-400 fill-yellow-300 drop-shadow-sm' : 'text-gray-300 hover:text-yellow-200'}`}
                              fill={(formData as any)[scoreKey] >= star ? '#FACC15' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Justificativa (obrigatória)"
                        value={(formData as any)[justificationKey]}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, [justificationKey]: e.target.value }));
                        }}
                        className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none text-xs bg-white shadow-sm transition-all duration-200"
                        rows={2}
                        required
                      />
                    </div>
                  );
                })}
                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 font-medium text-xs sm:text-sm"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Salvar Rascunho'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFinal}
                    disabled={isLoading}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 font-medium text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Enviar Avaliação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateAssessmentFloatingButton; 