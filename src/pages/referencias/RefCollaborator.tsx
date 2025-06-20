import { useState, useEffect, type FormEvent } from 'react';
import TopBar from '../../components/TopBar';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';

interface Teammate {
  id: string;
  name: string;
  jobTitle: string;
}
interface ProjectApiResponse {
  projectName: string;
  teammates: Teammate[];
}
interface Collaborator {
  id: string;
  name: string;
  role: string;
}

const RefCollaborator = () => {
  const [allCollaborators, setAllCollaborators] = useState<Collaborator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [justification, setJustification] = useState('');
  const [completedEvaluations, setCompletedEvaluations] = useState(0);
  const totalEvaluations = 4;

  useEffect(() => {
    const fetchAllTeammates = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token de autenticação não encontrado no localStorage.');

        const response = await fetch('/api/projects/teammates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Falha ao buscar colegas de equipe: ${response.statusText}`);

        const projectsData: ProjectApiResponse[] = await response.json();
        const collaboratorMap = new Map<string, Collaborator>();
        projectsData.forEach(project => {
          project.teammates.forEach(teammate => {
            if (!collaboratorMap.has(teammate.id)) {
              collaboratorMap.set(teammate.id, {
                id: teammate.id,
                name: teammate.name,
                role: teammate.jobTitle,
              });
            }
          });
        });
        setAllCollaborators(Array.from(collaboratorMap.values()));
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTeammates();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const results = allCollaborators.filter(collaborator =>
        collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [searchQuery, allCollaborators]);

  const handleSelectCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setJustification('');
    setSearchQuery('');
    setFilteredResults([]);
  };

  const handleClearSelection = () => {
    setSelectedCollaborator(null);
    setJustification('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCollaborator) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    const feedbackData = {
      referencedUserId: selectedCollaborator.id,
      justification: justification,
    };

    try {
      const response = await fetch('/api/evaluations/collaborator/reference-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert(`Feedback para ${selectedCollaborator.name} enviado com sucesso!`);
        setSelectedCollaborator(null);
        setJustification('');
        setCompletedEvaluations(prevCount => Math.min(prevCount + 1, totalEvaluations));
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Falha ao enviar feedback.');
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Ocorreu um problema.'}`);
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-100'>
      <div className='flex flex-col flex-1'>
        <TopBar onSave={handleSubmit} isSaveDisabled={!selectedCollaborator || !justification.trim()} />
        <main className='flex-1 p-8 pt-[110px]'>
          <div className='mb-6'>
            <div className='max-w mx-auto relative'>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <SearchResults
                results={filteredResults}
                onSelect={handleSelectCollaborator}
                isLoading={isLoading && searchQuery.length === 0}
              />
            </div>

            {selectedCollaborator && (
              <div className='block w-full pl-10 mt-5 pr-3 pt-10 pb-10 rounded-2xl bg-white shadow-lg'>
                <div className='flex justify-between items-start pr-10'>
                  <div>
                    <h1 className='mb-2 ml-30 font-semibold text-md'>{selectedCollaborator.name}</h1>
                    <h2 className='mb-10 ml-32 font-semibold text-sm text-gray-700'>{selectedCollaborator.role}</h2>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className='text-gray-400 hover:text-red-500 font-bold text-2xl px-2'
                    title='Remover seleção'
                  >
                    &times;
                  </button>
                </div>

                <div className='mt-5 flex justify-center'>
                  <textarea
                    placeholder={`Escreva seu feedback sobre ${selectedCollaborator.name}...`}
                    rows={3}
                    className='block w-full max-w-2xl p-3 rounded-lg border border-gray-300 sm:text-sm resize-none'
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          <div className='max-w mx-auto mt-5'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-semibold text-gray-800'>Status da Avaliação</h3>
              <span className='text-sm font-bold text-gray-600'>
                {completedEvaluations}/{totalEvaluations} Concluído
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2.5'>
              <div
                className='bg-green-600 h-2.5 rounded-full transition-all duration-500'
                style={{ width: `${(completedEvaluations / totalEvaluations) * 100}%` }}
              ></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RefCollaborator;
