import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calculator, Users, TrendingUp, Brain, Target, Award } from 'lucide-react';
import type { TalentMatrixPosition } from '../../types/talentMatrix';

const TalentMatrixMethodology: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collaborator = location.state?.collaborator as TalentMatrixPosition | undefined;

  // Função para calcular o score de senioridade
  const getSeniorityScore = (seniority: string): number => {
    const seniorityMap: Record<string, number> = {
      'junior': 4.5,
      'pleno': 4.0,
      'senior': 3.5,
      'especialista': 3.0,
      'principal': 2.5,
      'staff': 2.0
    };
    return seniorityMap[seniority.toLowerCase()] || 3.0;
  };

  // Se não tiver colaborador, redireciona de volta
  if (!collaborator) {
    navigate('/rh/matriz-talento');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/rh/matriz-talento')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar à Matriz de Talento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ backgroundColor: collaborator.matrixColor }}
              >
                {collaborator.initials}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {collaborator.name}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {collaborator.jobTitle} • {collaborator.seniority}
            </p>
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: collaborator.matrixColor }}
            >
              {collaborator.matrixLabel}
            </span>
          </div>

          {/* Performance Score */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Performance Score: {collaborator.performanceScore.toFixed(1)}/5.0
              </h2>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Composição do Score</h3>
              
              {/* Verificar se tem gestor para determinar os pesos */}
              {(() => {
                const hasManager = collaborator.evaluationDetails?.managerAssessmentScore !== undefined && collaborator.evaluationDetails?.managerAssessmentScore !== null;
                const selfWeight = hasManager ? 0.2 : 0.4;
                const managerWeight = 0.5;
                const score360Weight = hasManager ? 0.3 : 0.6;

                return (
                  <div className="space-y-3">
                    {/* Aviso sobre redistribuição de pesos */}
                    {!hasManager && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                        <div className="text-sm text-yellow-800">
                          <strong>⚖️ Redistribuição de Pesos:</strong> Como este colaborador não possui gestor, 
                          os pesos foram redistribuídos automaticamente para manter a justiça na avaliação.
                        </div>
                      </div>
                    )}

                    {collaborator.evaluationDetails?.selfAssessmentScore && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800">
                          📝 Autoavaliação ({(selfWeight * 100).toFixed(0)}%)
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-blue-900">
                            {collaborator.evaluationDetails.selfAssessmentScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-blue-700">
                            {collaborator.evaluationDetails.selfAssessmentScore.toFixed(1)} × {selfWeight} = {(collaborator.evaluationDetails.selfAssessmentScore * selfWeight).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {collaborator.evaluationDetails?.managerAssessmentScore && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800">👔 Avaliação do Gestor (50%)</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-900">
                            {collaborator.evaluationDetails.managerAssessmentScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-blue-700">
                            {collaborator.evaluationDetails.managerAssessmentScore.toFixed(1)} × 0.5 = {(collaborator.evaluationDetails.managerAssessmentScore * 0.5).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {collaborator.evaluationDetails?.assessment360Score && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800">
                          🔄 Avaliações 360° ({(score360Weight * 100).toFixed(0)}%)
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-blue-900">
                            {collaborator.evaluationDetails.assessment360Score.toFixed(1)}
                          </div>
                          <div className="text-sm text-blue-700">
                            {collaborator.evaluationDetails.assessment360Score.toFixed(1)} × {score360Weight} = {(collaborator.evaluationDetails.assessment360Score * score360Weight).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-blue-200 pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-900">Score Final</span>
                        <span className="font-bold text-xl text-blue-900">
                          {collaborator.performanceScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Potential Score */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Potential Score: {collaborator.potentialScore.toFixed(1)}/5.0
              </h2>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Fatores de Potencial</h3>
              <div className="space-y-4">
                
                {/* Fator 1: Senioridade */}
                <div className="flex justify-between items-center">
                  <span className="text-green-800">🎯 Senioridade ({collaborator.seniority})</span>
                  <div className="text-right">
                    <div className="font-bold text-green-900">
                      {getSeniorityScore(collaborator.seniority).toFixed(1)}
                    </div>
                    <div className="text-sm text-green-700">
                      Score base para {collaborator.seniority.toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Informação sobre outros fatores */}
                <div className="border-t border-green-200 pt-3">
                  <div className="text-sm text-green-800 mb-2">
                    • Critérios específicos de potencial (capacidade de aprender, team player, resiliência)
                  </div>
                  <div className="text-sm text-green-800 mb-2">
                    • Consistência nas avaliações 360° (se houver múltiplas avaliações)
                  </div>
                </div>

                <div className="border-t border-green-200 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-900">Score Final</span>
                    <span className="font-bold text-xl text-green-900">
                      {collaborator.potentialScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mt-1 text-right">
                    Média dos fatores aplicáveis
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posicionamento na Matriz */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Posicionamento na Matriz</h2>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-indigo-800">Performance: {collaborator.performanceScore.toFixed(1)}</span>
                <span className="text-indigo-800">Potencial: {collaborator.potentialScore.toFixed(1)}</span>
              </div>
              
              <div className="text-center">
                <div
                  className="inline-block px-6 py-3 rounded-lg text-white font-bold text-lg"
                  style={{ backgroundColor: collaborator.matrixColor }}
                >
                  {collaborator.matrixLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentMatrixMethodology; 