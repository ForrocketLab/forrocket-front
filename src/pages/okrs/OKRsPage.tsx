import React, { useState, useEffect } from 'react';
import { Plus, Target, Filter } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import OKRService from '../../services/OKRService';
import type { OKRSummary } from '../../types/okrs';
import OKRCard from './components/OKRCard.tsx';
import CreateOKRModal from './components/CreateOKRModal.tsx';
import OKRStats from './components/OKRStats.tsx';

const OKRsPage: React.FC = () => {
  const [okrs, setOkrs] = useState<OKRSummary[]>([]);
  const [filteredOkrs, setFilteredOkrs] = useState<OKRSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  const toast = useGlobalToast();

  useEffect(() => {
    fetchOKRs();
  }, []);

  useEffect(() => {
    filterOKRs();
  }, [okrs, selectedStatus, selectedQuarter]);

  const fetchOKRs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await OKRService.getUserOKRs();
      setOkrs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar OKRs';
      setError(errorMessage);
      toast.error('Erro ao carregar OKRs', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOKRs = () => {
    let filtered = [...okrs];

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'COMPLETED') {
        // Para status concluído, considerar tanto status COMPLETED quanto progresso >= 100%
        filtered = filtered.filter(okr => okr.status === 'COMPLETED' || okr.overallProgress >= 100);
      } else if (selectedStatus === 'ACTIVE') {
        // Para status ativo, considerar apenas OKRs ativos com progresso < 100%
        filtered = filtered.filter(okr => okr.status === 'ACTIVE' && okr.overallProgress < 100);
      } else {
        // Para outros status, usar filtro padrão
        filtered = filtered.filter(okr => okr.status === selectedStatus);
      }
    }

    if (selectedQuarter !== 'all') {
      filtered = filtered.filter(okr => okr.quarter === selectedQuarter);
    }

    setFilteredOkrs(filtered);
  };

  const handleCreateOKR = () => {
    setShowCreateModal(true);
  };

  const handleOKRCreated = () => {
    fetchOKRs();
    setShowCreateModal(false);
    toast.success('OKR criado com sucesso!', 'Seu novo OKR foi criado e já está disponível na lista.');
  };

  const handleDeleteOKR = async (id: string) => {
    try {
      await OKRService.deleteOKR(id);
      await fetchOKRs();
      toast.success('OKR deletado', 'O OKR foi removido com sucesso.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar OKR';
      setError(errorMessage);
      toast.error('Erro ao deletar OKR', errorMessage);
    }
  };

  const getUniqueQuarters = () => {
    const quarters = [...new Set(okrs.map(okr => okr.quarter))];
    return quarters.sort().reverse();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#085F60]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Meus OKRs</h1>
              <p className="text-lg text-gray-600">
                Defina e acompanhe seus objetivos e resultados-chave
              </p>
            </div>
            <button
              onClick={handleCreateOKR}
              className="bg-[#085F60] hover:bg-[#064247] text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md font-semibold"
            >
              <Plus className="h-5 w-5" />
              Novo OKR
            </button>
          </div>

          {/* Stats */}
          <OKRStats okrs={okrs} />
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filtros:</span>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="PAUSED">Pausado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>

            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#085F60] focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">Todos os trimestres</option>
              {getUniqueQuarters().map(quarter => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* OKRs Grid */}
        {filteredOkrs.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {okrs.length === 0 ? 'Nenhum OKR criado ainda' : 'Nenhum OKR encontrado com os filtros aplicados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {okrs.length === 0 
                ? 'Comece criando seu primeiro OKR para definir e acompanhar seus objetivos.'
                : 'Tente ajustar os filtros para encontrar seus OKRs.'
              }
            </p>
            {okrs.length === 0 && (
              <button
                onClick={handleCreateOKR}
                className="bg-[#085F60] hover:bg-[#064247] text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-5 w-5" />
                Criar Primeiro OKR
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredOkrs.map(okr => (
              <OKRCard
                key={okr.id}
                okr={okr}
                onDelete={handleDeleteOKR}
                onRefresh={fetchOKRs}
              />
            ))}
          </div>
        )}

        {/* Create OKR Modal */}
        {showCreateModal && (
          <CreateOKRModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleOKRCreated}
          />
        )}
      </div>
    </div>
  );
};

export default OKRsPage; 