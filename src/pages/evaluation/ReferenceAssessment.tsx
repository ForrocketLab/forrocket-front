import { useState, useEffect, useMemo } from 'react';
import { Search, Users, Save } from 'lucide-react';
import { ReferenceEvaluation } from './ReferenceEvaluation';
import EvaluationService, { ReferenceAssessmentDto } from '../../services/EvaluationService';
import { useEvaluation } from '../../hooks/useEvaluation';

// Interface para colaborador disponível
interface AvailableCollaborator {
  id: string;
  name: string;
  role: string;
  initials: string;
  department?: string;
  email?: string; // Adicionado para armazenar o email do colaborador
}

const ReferenceAssessment = () => {
  const [availableCollaborators, setAvailableCollaborators] = useState<AvailableCollaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useEvaluation();

  // Derivar referências selecionadas a partir do contexto
  const selectedReferences = useMemo(() => state.references, [state.references]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar colaboradores disponíveis do backend
        const availableCollabs = await EvaluationService.getAvailableCollaborators();
        const transformedCollaborators = availableCollabs.map(collab => ({
          id: collab.id,
          name: collab.name,
          role: 'Colaborador', // Valor padrão, backend não retorna cargo
          initials: collab.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2),
          department: '',
          email: collab.email,
        }));
        setAvailableCollaborators(transformedCollaborators);

        // Carregar referências existentes do backend apenas se não há dados no Context
        if (selectedReferences.length === 0) {
          const existingReferences = await EvaluationService.getReferenceFeedbacks();
          dispatch({ type: 'SET_REFERENCES', payload: existingReferences });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    // Se já tem dados no contexto, monta a UI a partir deles
    if (selectedReferences.length > 0) {
      setLoading(false);
      return;
    }

    loadData();
  }, [dispatch, selectedReferences.length]);

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

    dispatch({ type: 'ADD_REFERENCE', payload: newReference });
    setSearchTerm('');
    setShowSearchResults(false);
    // Remover toast de sucesso - salvar silenciosamente
  };

  const handleJustificationChange = (referenceId: string, justification: string) => {
    dispatch({ type: 'UPDATE_REFERENCE_JUSTIFICATION', payload: { id: referenceId, justification } });
  };

  // Remover função de salvar todas as referências automaticamente
  const handleSaveAllReferences = async () => {
    console.log('Salvando referências localmente apenas');
  };

  const handleRemoveReference = (referenceId: string) => {
    dispatch({ type: 'REMOVE_REFERENCE', payload: referenceId });
    // Remover toast de sucesso - remover silenciosamente
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
                  className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
                >
                  <Save className='h-4 w-4' />
                  <span>Salvar Todas</span>
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
