import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Filter, AlertTriangle } from 'lucide-react';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import PDIService from '../../services/PDIService';
import type { PDISummary } from '../../types/pdis';
import { isPDIOverdue, isPDINearDeadline } from '../../types/pdis';
import PDICard from './components/PDICard';
import CreatePDIModal from './components/CreatePDIModal';
import PDIStats from './components/PDIStats';

const PDIsPage: React.FC = () => {
  const [pdis, setPdis] = useState<PDISummary[]>([]);
  const [filteredPdis, setFilteredPdis] = useState<PDISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const toast = useGlobalToast();

  useEffect(() => {
    fetchPDIs();
  }, []);

  useEffect(() => {
    filterPDIs();
  }, [pdis, selectedStatus]);

  const fetchPDIs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await PDIService.getUserPDIs();
      setPdis(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar PDIs';
      setError(errorMessage);
      toast.error('Erro ao carregar PDIs', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPDIs = () => {
    let filtered = [...pdis];

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'COMPLETED') {
        filtered = filtered.filter(pdi => pdi.status === 'COMPLETED');
      } else if (selectedStatus === 'IN_PROGRESS') {
        filtered = filtered.filter(pdi => pdi.status === 'IN_PROGRESS' && pdi.progressPercentage < 100);
      } else if (selectedStatus === 'OVERDUE') {
        filtered = filtered.filter(pdi => isPDIOverdue(pdi));
      } else {
        filtered = filtered.filter(pdi => pdi.status === selectedStatus);
      }
    } else {
      // Quando mostrando todos, priorizar PDIs em atraso no topo
      filtered = filtered.sort((a, b) => {
        const aOverdue = isPDIOverdue(a);
        const bOverdue = isPDIOverdue(b);
        const aNearDeadline = isPDINearDeadline(a);
        const bNearDeadline = isPDINearDeadline(b);

        // PDIs em atraso vêm primeiro
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Se ambos em atraso ou ambos não em atraso, verificar próximos do vencimento
        if (aNearDeadline && !bNearDeadline) return -1;
        if (!aNearDeadline && bNearDeadline) return 1;

        // Se mesmo status de urgência, manter ordem original (por data de atualização)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    setFilteredPdis(filtered);
  };

  const handleCreatePDI = () => {
    setShowCreateModal(true);
  };

  const handlePDICreated = () => {
    fetchPDIs();
    setShowCreateModal(false);
    toast.success('PDI criado com sucesso!', 'Seu novo Plano de Desenvolvimento Individual foi criado e já está disponível na lista.');
  };

  const handleDeletePDI = async (id: string) => {
    try {
      await PDIService.deletePDI(id);
      await fetchPDIs();
      toast.success('PDI deletado', 'O PDI foi removido com sucesso.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar PDI';
      setError(errorMessage);
      toast.error('Erro ao deletar PDI', errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#085F60]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meus PDIs</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Planeje e acompanhe seu desenvolvimento pessoal e profissional
            </p>
          </div>
          <button
            onClick={handleCreatePDI}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo PDI</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Stats */}
        <PDIStats pdis={pdis} />

        {/* Alerta de PDIs em atraso */}
        {pdis.some(p => isPDIOverdue(p)) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Atenção!</span> Você tem {pdis.filter(p => isPDIOverdue(p)).length} PDI{pdis.filter(p => isPDIOverdue(p)).length > 1 ? 's' : ''} em atraso. 
                  <button 
                    onClick={() => setSelectedStatus('OVERDUE')}
                    className="ml-2 underline hover:no-underline font-semibold"
                  >
                    Ver PDIs em atraso
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}



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
              <option value="OVERDUE" className="text-red-600 font-semibold">🚨 Em Atraso</option>
              <option value="NOT_STARTED">Não Iniciado</option>
              <option value="IN_PROGRESS">Em Progresso</option>
              <option value="COMPLETED">Concluído</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* PDIs Grid */}
        {filteredPdis.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {pdis.length === 0 ? 'Nenhum PDI criado ainda' : 'Nenhum PDI encontrado com os filtros aplicados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pdis.length === 0 
                ? 'Comece criando seu primeiro Plano de Desenvolvimento Individual para organizar suas metas de crescimento.'
                : 'Tente ajustar os filtros para encontrar seus PDIs.'
              }
            </p>
            {pdis.length === 0 && (
              <button
                onClick={handleCreatePDI}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 mx-auto transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro PDI
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPdis.map(pdi => (
              <PDICard
                key={pdi.id}
                pdi={pdi}
                onDelete={handleDeletePDI}
                onRefresh={fetchPDIs}
              />
            ))}
          </div>
        )}

        {/* Create PDI Modal */}
        <CreatePDIModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPDICreated={handlePDICreated}
        />
      </div>
    </div>
  );
};

export default PDIsPage; 