import React, { useState } from 'react';
import { ArrowLeft, Filter, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TalentMatrix from '../../components/TalentMatrix';
import type { TalentMatrixPosition } from '../../types/talentMatrix';

const TalentMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCollaborator, setSelectedCollaborator] = useState<TalentMatrixPosition | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [cycleFilter, setCycleFilter] = useState<string>('');

  const handleCollaboratorSelect = (collaborator: TalentMatrixPosition) => {
    setSelectedCollaborator(collaborator);
  };



  const handleViewCalculationDetails = () => {
    if (selectedCollaborator) {
      navigate('/rh/matriz-talento/metodologia', { 
        state: { collaborator: selectedCollaborator } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/rh')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar ao Dashboard RH</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ciclo de Avaliação
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={cycleFilter}
                      onChange={(e) => setCycleFilter(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors cursor-pointer"
                    >
                      <option value="">🟢 Ciclo Ativo (2025.1)</option>
                      <option value="2025.1">2025.1 - Primeiro Semestre 2025</option>
                      <option value="2024.2">2024.2 - Segundo Semestre 2024</option>
                      <option value="2024.1">2024.1 - Primeiro Semestre 2024</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {cycleFilter && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-medium">
                      <span>Filtro ativo:</span>
                      <span className="font-semibold">{cycleFilter}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setCycleFilter('')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Limpar
                  </button>
                </div>
              </div>

              {!cycleFilter && (
                <div className="mt-3 flex items-center gap-2 text-xs text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Exibindo dados do ciclo ativo (2025.1) com avaliações disponíveis</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Matriz Principal */}
          <div className="flex-1">
            <TalentMatrix 
              cycle={cycleFilter || undefined}
              onCollaboratorSelect={handleCollaboratorSelect}
            />
          </div>

          {/* Painel Lateral - Detalhes do Colaborador */}
          {selectedCollaborator && (
            <div className="lg:w-80 mt-26">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Detalhes</h3>
                  <button
                    onClick={() => setSelectedCollaborator(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Avatar e Info Básica */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-3"
                    style={{ backgroundColor: selectedCollaborator.matrixColor }}
                  >
                    {selectedCollaborator.initials}
                  </div>
                  <h4 className="font-semibold text-gray-900">{selectedCollaborator.name}</h4>
                  <p className="text-sm text-gray-600">{selectedCollaborator.jobTitle}</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mt-2"
                    style={{ backgroundColor: selectedCollaborator.matrixColor }}
                  >
                    {selectedCollaborator.matrixLabel}
                  </span>
                </div>

                {/* Métricas */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Performance</span>
                      <span className="text-sm font-bold text-gray-900">
                        {selectedCollaborator.performanceScore.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${(selectedCollaborator.performanceScore / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Potencial</span>
                      <span className="text-sm font-bold text-gray-900">
                        {selectedCollaborator.potentialScore.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${(selectedCollaborator.potentialScore / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unidade:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCollaborator.businessUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Senioridade:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCollaborator.seniority}</span>
                  </div>
                  {selectedCollaborator.evaluationDetails && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Avaliações:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCollaborator.evaluationDetails.totalEvaluations}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalhes das Avaliações */}
                {selectedCollaborator.evaluationDetails && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Scores por Avaliação</h5>
                    <div className="space-y-2">
                      {selectedCollaborator.evaluationDetails.selfAssessmentScore && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Autoavaliação:</span>
                          <span className="font-medium">{selectedCollaborator.evaluationDetails.selfAssessmentScore.toFixed(1)}</span>
                        </div>
                      )}
                      {selectedCollaborator.evaluationDetails.managerAssessmentScore && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gestor:</span>
                          <span className="font-medium">{selectedCollaborator.evaluationDetails.managerAssessmentScore.toFixed(1)}</span>
                        </div>
                      )}
                      {selectedCollaborator.evaluationDetails.assessment360Score && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">360°:</span>
                          <span className="font-medium">{selectedCollaborator.evaluationDetails.assessment360Score.toFixed(1)}</span>
                        </div>
                      )}
                      {selectedCollaborator.evaluationDetails.committeeScore && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Comitê:</span>
                          <span className="font-medium">{selectedCollaborator.evaluationDetails.committeeScore.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="space-y-2">
                  <button
                    onClick={handleViewCalculationDetails}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Saiba mais
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentMatrixPage; 