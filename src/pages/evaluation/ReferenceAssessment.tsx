import { useState, useEffect } from 'react';
import { Search, Users, Save } from 'lucide-react';
import { ReferenceEvaluation } from './ReferenceEvaluation';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import EvaluationService, { ReferenceAssessmentDto } from '../../services/EvaluationService';

// Interface para colaborador disponível
interface AvailableCollaborator {
  id: string;
  name: string;
  role: string;
  initials: string;
  department?: string;
}

// Mock data de colaboradores disponíveis (fallback)
/*
const mockAvailableCollaborators: AvailableCollaborator[] = [
  {
    id: 'col-1',
    name: 'Maria Silva Santos',
    role: 'Product Manager',
    initials: 'MS',
    department: 'Produto',
  },
  {
    id: 'col-2',
    name: 'João Pedro Oliveira',
    role: 'Senior Designer',
    initials: 'JP',
    department: 'Design',
  },
  {
    id: 'col-3',
    name: 'Ana Carolina Lima',
    role: 'Data Analyst',
    initials: 'AC',
    department: 'Dados',
  },
  {
    id: 'col-4',
    name: 'Carlos Eduardo Silva',
    role: 'Tech Lead',
    initials: 'CE',
    department: 'Engenharia',
  },
  {
    id: 'col-5',
    name: 'Fernanda Costa',
    role: 'UX Researcher',
    initials: 'FC',
    department: 'Design',
  },
  {
    id: 'col-6',
    name: 'Rafael Mendes',
    role: 'DevOps Engineer',
    initials: 'RM',
    department: 'Engenharia',
  },
  {
    id: 'col-7',
    name: 'Beatriz Alves',
    role: 'Marketing Manager',
    initials: 'BA',
    department: 'Marketing',
  },
  {
    id: 'col-8',
    name: 'Gabriel Santos',
    role: 'Full Stack Developer',
    initials: 'GS',
    department: 'Engenharia',
  },
];
*/

const ReferenceAssessment = () => {
  const [availableCollaborators, setAvailableCollaborators] = useState<AvailableCollaborator[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<ReferenceAssessmentDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const toast = useGlobalToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar colaboradores disponíveis - usar mock como fallback
        let transformedCollaborators = mockAvailableCollaborators;

        try {
          // Tentar carregar do backend primeiro
          const availableCollabs = await EvaluationService.getAvailableCollaborators();

          // Transformar os dados para o formato esperado pelo componente
          transformedCollaborators = availableCollabs.map(collab => ({
            id: collab.id,
            name: collab.name,
            role: 'Colaborador', // Valor padrão já que não vem do backend
            initials: collab.name
              .split(' ')
              .map(word => word.charAt(0))
              .join('')
              .toUpperCase()
              .substring(0, 2),
            department: 'Departamento',
          }));

          console.log('Colaboradores carregados do backend:', transformedCollaborators);
        } catch (collaboratorError) {
          console.warn('Erro ao carregar colaboradores do backend, usando dados mock:', collaboratorError);
          // transformedCollaborators já está definido com mockAvailableCollaborators
        }

        setAvailableCollaborators(transformedCollaborators);

        // Carregar referências existentes do backend
        const existingReferences = await EvaluationService.getReferenceFeedbacks();
        setSelectedReferences(existingReferences);

        console.log('Colaboradores disponíveis carregados:', transformedCollaborators);
        console.log('Referências existentes carregadas:', existingReferences);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados', 'Não foi possível carregar os dados iniciais.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar colaboradores disponíveis (excluindo os já selecionados)
  const filteredAvailableCollaborators = availableCollaborators.filter(
    collaborator =>
      !selectedReferences.some(ref => ref.id === collaborator.id) &&
      (collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborator.department?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Adicionar colaborador como referência
  const handleAddReference = (collaborator: AvailableCollaborator) => {
    const newReference: ReferenceAssessmentDto = {
      id: collaborator.id,
      referenceName: collaborator.name,
      referenceRole: collaborator.role,
      referenceInitials: collaborator.initials,
      justification: '',
    };

    setSelectedReferences(prev => [...prev, newReference]);
    setSearchTerm('');
    setShowSearchResults(false);
    toast.success('Referência adicionada', `${collaborator.name} foi adicionado como referência.`);
  };

  const handleReferenceUpdate = (referenceId: string, updates: Partial<ReferenceAssessmentDto>) => {
    // Atualizar apenas localmente, sem enviar para o backend
    setSelectedReferences(prev =>
      prev.map(reference => (reference.id === referenceId ? { ...reference, ...updates } : reference)),
    );
  };

  const handleJustificationChange = (referenceId: string, justification: string) => {
    handleReferenceUpdate(referenceId, { justification });
  };

  const handleSaveAllReferences = async () => {
    try {
      setUpdating('all');

      // Log detalhado dos dados que serão enviados ao backend
      console.log('=== DADOS PARA BACKEND ===');
      console.log('Total de referências:', selectedReferences.length);
      console.log('Dados completos:', JSON.stringify(selectedReferences, null, 2));

      selectedReferences.forEach((reference, index) => {
        console.log(`\n--- Referência ${index + 1} ---`);
        console.log('ID:', reference.id);
        console.log('Nome:', reference.referenceName);
        console.log('Cargo:', reference.referenceRole);
        console.log('Iniciais:', reference.referenceInitials);
        console.log('Justificativa:', reference.justification || '(vazia)');
        console.log('Tamanho da justificativa:', reference.justification.length, 'caracteres');
      });

      // Chamar o endpoint real do backend
      await EvaluationService.saveAllReferenceFeedbacks(selectedReferences);

      console.log('✅ Todas as referências salvas com sucesso!');
      toast.success('Referências salvas', 'Todas as avaliações foram salvas com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao salvar todas as referências:', error);
      toast.error('Erro ao salvar', 'Não foi possível salvar as avaliações. Tente novamente.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveReference = (referenceId: string) => {
    setSelectedReferences(prev => prev.filter(reference => reference.id !== referenceId));
    toast.success('Referência removida', 'A referência foi removida da sua avaliação.');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-6 py-6'>
        {/* Search with Results */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm mb-6'>
          <div className='p-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Buscar colaboradores para adicionar como referência'
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchTerm.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto'>
                  {filteredAvailableCollaborators.length > 0 ? (
                    filteredAvailableCollaborators.map(collaborator => (
                      <button
                        key={collaborator.id}
                        onClick={() => handleAddReference(collaborator)}
                        className='w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3'
                      >
                        <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                          <span className='text-sm font-medium text-blue-600'>{collaborator.initials}</span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>{collaborator.name}</p>
                          <p className='text-sm text-gray-500'>
                            {collaborator.role} • {collaborator.department}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className='px-4 py-3 text-gray-500 text-center'>Nenhum colaborador encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save All Button */}
        {selectedReferences.length > 0 && (
          <div className='bg-white border border-gray-200 rounded-lg shadow-sm mb-6'>
            <div className='p-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>Referências Selecionadas</h3>
                  <p className='text-sm text-gray-600'>
                    {selectedReferences.length} referência{selectedReferences.length > 1 ? 's' : ''} adicionada
                    {selectedReferences.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={handleSaveAllReferences}
                  disabled={updating === 'all'}
                  className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors'
                >
                  {updating === 'all' ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      <span>Salvando todas...</span>
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      <span>Salvar Todas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected References List */}
        <div className='space-y-4'>
          {loading ? (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
                <p className='text-gray-600'>Carregando colaboradores...</p>
              </div>
            </div>
          ) : selectedReferences.length > 0 ? (
            selectedReferences.map(reference => (
              <div key={reference.id}>
                <ReferenceEvaluation
                  id={reference.id}
                  name={reference.referenceName}
                  role={reference.referenceRole}
                  initials={reference.referenceInitials}
                  justification={reference.justification}
                  onJustificationChange={justification => handleJustificationChange(reference.id, justification)}
                  onRemove={() => handleRemoveReference(reference.id)}
                />
              </div>
            ))
          ) : (
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-8 text-center'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Nenhuma referência selecionada</h3>
                <p className='text-gray-600'>
                  Use a barra de busca acima para encontrar e adicionar colaboradores como referências
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceAssessment;
