import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import type { TalentMatrixData, TalentMatrixPosition, MatrixCell } from '../types/talentMatrix';
import { MATRIX_CELLS } from '../types/talentMatrix';
import HRService from '../services/HRService';

interface TalentMatrixProps {
  cycle?: string;
  onCollaboratorSelect?: (collaborator: TalentMatrixPosition) => void;
}

const TalentMatrix: React.FC<TalentMatrixProps> = ({ cycle, onCollaboratorSelect }) => {
  const [matrixData, setMatrixData] = useState<TalentMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadMatrixData();
  }, [cycle]);

  const loadMatrixData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HRService.getTalentMatrix(cycle);
      setMatrixData(data);
    } catch (err) {
      setError('Erro ao carregar dados da matriz de talento');
      console.error('Erro ao carregar matriz:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCollaboratorsInCell = (cellId: number): TalentMatrixPosition[] => {
    if (!matrixData) return [];
    return matrixData.positions.filter(pos => pos.matrixPosition === cellId);
  };

  const getFilteredCollaborators = (): TalentMatrixPosition[] => {
    if (!matrixData) return [];
    if (!selectedCategory) return matrixData.positions;
    return matrixData.positions.filter(pos => pos.matrixLabel === selectedCategory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Carregando matriz de talento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-600 font-medium">Erro ao carregar matriz</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button
          onClick={loadMatrixData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Nenhum dado de matriz disponível</p>
      </div>
    );
  }

  // Verificar se há dados insuficientes
  if (matrixData.hasInsufficientData) {
    return (
      <div className="space-y-6">
        {/* Header com informações do ciclo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Matriz 9-Box de Talento</h2>
              <p className="text-gray-600 text-sm">Ciclo: {matrixData.cycle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Última verificação</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(matrixData.generatedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de dados insuficientes */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dados Insuficientes</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {matrixData.message}
            </p>
            <div className="text-sm text-gray-500">
              <p>Para gerar a matriz de talentos são necessárias avaliações como:</p>
              <ul className="mt-2 space-y-1">
                <li>• Autoavaliações dos colaboradores</li>
                <li>• Avaliações 360° entre pares</li>
                <li>• Avaliações de gestores</li>
                <li>• Avaliações do comitê</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-800">Total</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">
              {matrixData.stats.totalCollaborators}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-800">Top Talentos</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-900 mt-1">
              {matrixData.stats.topTalents}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              <span className="text-xs sm:text-sm font-medium text-yellow-800">% Top Talentos</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-yellow-900 mt-1">
              {Math.round((matrixData.stats.topTalents / matrixData.stats.totalCollaborators) * 100)}%
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-red-800">Baixo Desempenho</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-red-900 mt-1">
              {matrixData.stats.lowPerformers}
            </p>
          </div>
        </div>
      </div>

      {/* Matriz Visual */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Matriz Visual 9-Box</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded"></div>
              <span>Eixo X: Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded"></div>
              <span>Eixo Y: Potencial</span>
            </div>
          </div>
        </div>

        {/* Grid da Matriz */}
        <div className="relative">
          {/* Labels dos eixos */}
          <div className="absolute -left-8 sm:-left-16 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Potencial</span>
          </div>
          <div className="absolute -bottom-4 sm:-bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Performance</span>
          </div>

          {/* Grid 3x3 */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-2xl sm:max-w-3xl mx-auto">
            {/* Renderizar células baseado nas coordenadas x,y */}
            {[2, 1, 0].flatMap(y => 
              [0, 1, 2].map(x => {
                const cell = MATRIX_CELLS.find(c => c.x === x && c.y === y)!;
                const collaborators = getCollaboratorsInCell(cell.id);
              
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      relative border-2 rounded-lg p-1.5 sm:p-2 lg:p-4 min-h-20 sm:min-h-28 lg:min-h-36 cursor-pointer transition-all duration-200
                      ${selectedCategory === cell.label 
                        ? 'ring-2 ring-blue-500 border-blue-300' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    style={{ backgroundColor: cell.color + '10' }}
                    onClick={() => setSelectedCategory(
                      selectedCategory === cell.label ? null : cell.label
                    )}
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="font-medium text-xs sm:text-sm text-gray-900 truncate flex-1 mr-1">{cell.label}</h4>
                      <span className="text-xs bg-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0">
                        {collaborators.length}
                      </span>
                    </div>
                    
                    {/* Avatares dos colaboradores */}
                    <div className="flex flex-wrap gap-0.5 sm:gap-1 lg:gap-1.5 mt-1 sm:mt-2">
                      {collaborators.slice(0, 4).map((collab) => (
                        <div
                          key={collab.id}
                          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: cell.color }}
                          title={`${collab.name} - ${collab.jobTitle}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCollaboratorSelect?.(collab);
                          }}
                        >
                          {collab.initials}
                        </div>
                      ))}
                      {collaborators.length > 4 && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
                          +{collaborators.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lista Detalhada (quando categoria selecionada) */}
      {selectedCategory && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
          {/* Header da seção */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                  Colaboradores: {selectedCategory}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {getFilteredCollaborators().length} colaborador{getFilteredCollaborators().length !== 1 ? 'es' : ''} nesta categoria
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Fechar</span>
              <span className="sm:hidden">Fechar</span>
            </button>
          </div>

          {/* Grid de colaboradores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {getFilteredCollaborators().map(collaborator => (
              <div
                key={collaborator.id}
                className="group bg-white rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden"
                onClick={() => onCollaboratorSelect?.(collaborator)}
              >
                {/* Background decorativo */}
                <div 
                  className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full opacity-10 -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 lg:-mr-10 lg:-mt-10 transition-opacity group-hover:opacity-20"
                  style={{ backgroundColor: collaborator.matrixColor }}
                ></div>
                
                {/* Header do card */}
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-sm sm:text-base lg:text-lg font-bold text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: collaborator.matrixColor }}
                  >
                    {collaborator.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg group-hover:text-teal-700 transition-colors truncate">
                      {collaborator.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{collaborator.jobTitle}</p>
                    <p className="text-xs text-gray-500 truncate">{collaborator.seniority}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span 
                      className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: collaborator.matrixColor }}
                    >
                      {selectedCategory}
                    </span>
                  </div>
                </div>
                
                {/* Métricas principais */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700">Performance</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-blue-900">
                        {collaborator.performanceScore.toFixed(1)}
                      </span>
                      <span className="text-xs sm:text-sm text-blue-600">/5.0</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">Potencial</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-green-900">
                        {collaborator.potentialScore.toFixed(1)}
                      </span>
                      <span className="text-xs sm:text-sm text-green-600">/5.0</span>
                    </div>
                  </div>
                </div>
                
                {/* Informações adicionais */}
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="hidden sm:inline">Unidade:</span>
                      <span className="sm:hidden">Unid:</span>
                    </span>
                    <span className="font-semibold text-gray-900 truncate ml-2">{collaborator.businessUnit}</span>
                  </div>
                  
                  {collaborator.evaluationDetails && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 flex items-center gap-1 sm:gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">Avaliações:</span>
                        <span className="sm:hidden">Aval:</span>
                      </span>
                      <span className="font-semibold text-gray-900 bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">
                        {collaborator.evaluationDetails.totalEvaluations}
                      </span>
                    </div>
                  )}
                </div>

                {/* Indicador de clique */}
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentMatrix; 