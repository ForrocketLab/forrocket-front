import React, { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
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
    <div className="bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate('/rh')}
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-start gap-2 w-fit mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao Dashboard RH</span>
              <span className="sm:hidden">Voltar</span>
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Matriz 9-Box de Talento</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Visualize a matriz de performance e potencial dos colaboradores</p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg border transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${
              showFilters 
                ? 'bg-teal-600 border-teal-600 text-white' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filtros</span>
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciclo de Avaliação
                </label>
                <select
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Ciclo Ativo (2025.1)</option>
                  <option value="2024.2">Ciclo 2024.2</option>
                  <option value="2024.1">Ciclo 2024.1</option>
                </select>
              </div>
            </div>
            
            {!cycleFilter && (
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm">Exibindo dados do ciclo ativo (2025.1) com avaliações disponíveis</span>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
          {/* Matriz Principal */}
          <div className="flex-1 w-full">
            <TalentMatrix 
              cycle={cycleFilter || undefined}
              onCollaboratorSelect={handleCollaboratorSelect}
            />
          </div>

          {/* Painel Lateral - Detalhes do Colaborador */}
          {selectedCollaborator && (
            <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detalhes do Colaborador</h3>
                <button
                  onClick={() => setSelectedCollaborator(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Informações do Colaborador */}
              <div className="space-y-4">
                {/* Avatar e Nome */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-md"
                    style={{ backgroundColor: selectedCollaborator.matrixColor }}
                  >
                    {selectedCollaborator.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                      {selectedCollaborator.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{selectedCollaborator.jobTitle}</p>
                    <p className="text-xs text-gray-500 truncate">{selectedCollaborator.seniority}</p>
                  </div>
                </div>

                {/* Posição na Matriz */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Posição na Matriz</h5>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedCollaborator.matrixColor }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{selectedCollaborator.matrixLabel}</span>
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700">Performance</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold text-blue-900">
                        {selectedCollaborator.performanceScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-blue-600">/5.0</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">Potencial</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold text-green-900">
                        {selectedCollaborator.potentialScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-green-600">/5.0</span>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Unidade:</span>
                    <span className="font-medium text-gray-900 truncate">{selectedCollaborator.businessUnit}</span>
                  </div>
                  
                  {selectedCollaborator.evaluationDetails && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-600">Avaliações:</span>
                      <span className="font-medium text-gray-900">{selectedCollaborator.evaluationDetails.totalEvaluations}</span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleViewCalculationDetails}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Ver Metodologia</span>
                    <span className="sm:hidden">Metodologia</span>
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