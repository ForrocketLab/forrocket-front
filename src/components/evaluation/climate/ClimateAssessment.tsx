import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import ClimateService, { 
  ClimateAssessmentData, 
  CreateClimateAssessmentRequest,
  UpdateClimateAssessmentRequest 
} from '../../../services/ClimateService';
import { useAuth } from '../../../hooks/useAuth';

interface ClimateAssessmentProps {
  onComplete?: () => void;
}

const ClimateAssessment: React.FC<ClimateAssessmentProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<ClimateAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado local para os critérios
  const [criteria, setCriteria] = useState({
    relacionamentoLideranca: { score: 0, justification: '' },
    relacionamentoColegas: { score: 0, justification: '' },
    reconhecimentoValorizacao: { score: 0, justification: '' },
    cargaTrabalhoEquilibrio: { score: 0, justification: '' },
  });

  // Carregar avaliação existente
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const existingAssessment = await ClimateService.getClimateAssessment();
        
        if (existingAssessment) {
          setAssessment(existingAssessment);
          
          // Mapear respostas para o estado local
          const mappedCriteria = {
            relacionamentoLideranca: { score: 0, justification: '' },
            relacionamentoColegas: { score: 0, justification: '' },
            reconhecimentoValorizacao: { score: 0, justification: '' },
            cargaTrabalhoEquilibrio: { score: 0, justification: '' },
          };

          existingAssessment.answers.forEach(answer => {
            switch (answer.criterionId) {
              case 'relacionamento-lideranca':
                mappedCriteria.relacionamentoLideranca = { score: answer.score, justification: answer.justification };
                break;
              case 'relacionamento-colegas':
                mappedCriteria.relacionamentoColegas = { score: answer.score, justification: answer.justification };
                break;
              case 'reconhecimento-valorizacao':
                mappedCriteria.reconhecimentoValorizacao = { score: answer.score, justification: answer.justification };
                break;
              case 'carga-trabalho-equilibrio':
                mappedCriteria.cargaTrabalhoEquilibrio = { score: answer.score, justification: answer.justification };
                break;
            }
          });

          setCriteria(mappedCriteria);
        }
      } catch (err) {
        console.error('Erro ao carregar avaliação de clima:', err);
        setError('Erro ao carregar avaliação de clima organizacional');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, []);

  // Atualizar critério
  const updateCriterion = (criterionKey: keyof typeof criteria, field: 'score' | 'justification', value: number | string) => {
    setCriteria(prev => ({
      ...prev,
      [criterionKey]: {
        ...prev[criterionKey],
        [field]: value,
      },
    }));
  };

  // Salvar avaliação
  const saveAssessment = async () => {
    try {
      setSaving(true);
      setError(null);

      const data: CreateClimateAssessmentRequest | UpdateClimateAssessmentRequest = {
        relacionamentoLiderancaScore: criteria.relacionamentoLideranca.score,
        relacionamentoLiderancaJustification: criteria.relacionamentoLideranca.justification,
        relacionamentoColegasScore: criteria.relacionamentoColegas.score,
        relacionamentoColegasJustification: criteria.relacionamentoColegas.justification,
        reconhecimentoValorizacaoScore: criteria.reconhecimentoValorizacao.score,
        reconhecimentoValorizacaoJustification: criteria.reconhecimentoValorizacao.justification,
        cargaTrabalhoEquilibrioScore: criteria.cargaTrabalhoEquilibrio.score,
        cargaTrabalhoEquilibrioJustification: criteria.cargaTrabalhoEquilibrio.justification,
      };

      let result;
      if (assessment) {
        result = await ClimateService.updateClimateAssessment(data);
      } else {
        result = await ClimateService.createClimateAssessment(data as CreateClimateAssessmentRequest);
      }

      setAssessment(result);
      console.log('Avaliação de clima salva com sucesso');
    } catch (err) {
      console.error('Erro ao salvar avaliação de clima:', err);
      setError('Erro ao salvar avaliação de clima organizacional');
    } finally {
      setSaving(false);
    }
  };

  // Submeter avaliação
  const submitAssessment = async () => {
    try {
      setSaving(true);
      setError(null);

      // Verificar se todos os critérios estão preenchidos
      const isComplete = Object.values(criteria).every(
        criterion => criterion.score > 0 && criterion.justification.trim() !== ''
      );

      if (!isComplete) {
        setError('Por favor, preencha todos os critérios antes de submeter');
        return;
      }

      // Salvar primeiro se necessário
      if (!assessment) {
        await saveAssessment();
      }

      // Submeter
      const submittedAssessment = await ClimateService.submitClimateAssessment();
      setAssessment(submittedAssessment);
      
      console.log('Avaliação de clima submetida com sucesso');
      onComplete?.();
    } catch (err) {
      console.error('Erro ao submeter avaliação de clima:', err);
      setError('Erro ao submeter avaliação de clima organizacional');
    } finally {
      setSaving(false);
    }
  };

  // Verificar se está completo
  const isComplete = Object.values(criteria).every(
    criterion => criterion.score > 0 && criterion.justification.trim() !== ''
  );

  // Verificar se está submetido
  const isSubmitted = assessment?.status === 'SUBMITTED';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        <span className="ml-3 text-gray-600">Carregando avaliação de clima...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 md:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Avaliação de Clima Organizacional
          </h1>
          <p className="text-gray-600">
            Esta avaliação rápida nos ajuda a entender melhor o clima organizacional da empresa.
            Suas respostas são confidenciais e nos ajudarão a melhorar continuamente.
          </p>
          
          {assessment && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> {assessment.status === 'SUBMITTED' ? 'Submetida' : 'Rascunho'}
                {assessment.submittedAt && (
                  <span className="ml-2">
                    • Submetida em: {new Date(assessment.submittedAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Critérios */}
        <div className="space-y-6">
          {/* Relacionamento com a Liderança */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              1. Relacionamento com a Liderança
            </h2>
            <p className="text-gray-600 mb-4">
              Avalie o quanto você se sente respeitado(a), apoiado(a) e ouvido(a) pela sua liderança direta.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const StarIcon = star <= criteria.relacionamentoLideranca.score ? FaStar : FaRegStar;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateCriterion('relacionamentoLideranca', 'score', star)}
                        disabled={isSubmitted}
                        className={`transition-colors hover:scale-110 ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <StarIcon className="w-6 h-6 text-[#085F60]" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa
                </label>
                <textarea
                  value={criteria.relacionamentoLideranca.justification}
                  onChange={(e) => updateCriterion('relacionamentoLideranca', 'justification', e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Explique sua avaliação..."
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085F60] focus:border-[#085F60] text-sm resize-none placeholder-gray-400 ${isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Relacionamento com Colegas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              2. Relacionamento com Colegas
            </h2>
            <p className="text-gray-600 mb-4">
              Como você avalia a colaboração, respeito e convivência com seus colegas de equipe?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const StarIcon = star <= criteria.relacionamentoColegas.score ? FaStar : FaRegStar;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateCriterion('relacionamentoColegas', 'score', star)}
                        disabled={isSubmitted}
                        className={`transition-colors hover:scale-110 ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <StarIcon className="w-6 h-6 text-[#085F60]" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa
                </label>
                <textarea
                  value={criteria.relacionamentoColegas.justification}
                  onChange={(e) => updateCriterion('relacionamentoColegas', 'justification', e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Explique sua avaliação..."
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085F60] focus:border-[#085F60] text-sm resize-none placeholder-gray-400 ${isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Reconhecimento e Valorização */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              3. Reconhecimento e Valorização
            </h2>
            <p className="text-gray-600 mb-4">
              Você sente que seu trabalho é reconhecido e valorizado pela empresa?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const StarIcon = star <= criteria.reconhecimentoValorizacao.score ? FaStar : FaRegStar;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateCriterion('reconhecimentoValorizacao', 'score', star)}
                        disabled={isSubmitted}
                        className={`transition-colors hover:scale-110 ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <StarIcon className="w-6 h-6 text-[#085F60]" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa
                </label>
                <textarea
                  value={criteria.reconhecimentoValorizacao.justification}
                  onChange={(e) => updateCriterion('reconhecimentoValorizacao', 'justification', e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Explique sua avaliação..."
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085F60] focus:border-[#085F60] text-sm resize-none placeholder-gray-400 ${isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Carga de Trabalho e Equilíbrio */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              4. Carga de Trabalho e Equilíbrio
            </h2>
            <p className="text-gray-600 mb-4">
              Como você avalia sua carga de trabalho em relação ao equilíbrio com sua vida pessoal?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const StarIcon = star <= criteria.cargaTrabalhoEquilibrio.score ? FaStar : FaRegStar;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateCriterion('cargaTrabalhoEquilibrio', 'score', star)}
                        disabled={isSubmitted}
                        className={`transition-colors hover:scale-110 ${isSubmitted ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <StarIcon className="w-6 h-6 text-[#085F60]" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa
                </label>
                <textarea
                  value={criteria.cargaTrabalhoEquilibrio.justification}
                  onChange={(e) => updateCriterion('cargaTrabalhoEquilibrio', 'justification', e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Explique sua avaliação..."
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#085F60] focus:border-[#085F60] text-sm resize-none placeholder-gray-400 ${isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {!isSubmitted && (
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={saveAssessment}
              disabled={saving}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            
            <button
              onClick={submitAssessment}
              disabled={saving || !isComplete}
              className="px-6 py-2 bg-[#085F60] text-white rounded-lg hover:bg-[#064A4B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Submetendo...' : 'Submeter Avaliação'}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center">
              ✅ Avaliação de clima organizacional submetida com sucesso!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClimateAssessment; 