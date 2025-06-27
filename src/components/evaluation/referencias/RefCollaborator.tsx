import { useState, useEffect, type FormEvent } from 'react';
import SearchBar from '../../SearchBar';
import SearchResults from '../../SearchResults';
import { useEvaluation } from '../../../contexts/EvaluationProvider';

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
    const totalEvaluations = 1;

    const { referenceFeedbackData, addReferenceFeedback, removeReferenceFeedback } = useEvaluation();

    useEffect(() => {
        const fetchAllTeammates = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('Token de autenticação não encontrado no localStorage.');

                const response = await fetch('/api/projects/teammates', {
                    headers: { 'Authorization': `Bearer ${token}` }
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
                                role: teammate.jobTitle
                            });
                        }
                    });
                });
                setAllCollaborators(Array.from(collaboratorMap.values()));
            } catch (error) {
                console.error("Erro ao carregar colaboradores:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllTeammates();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() !== '') {
            const addedIds = referenceFeedbackData.map(f => f.referencedUserId);
            const results = allCollaborators.filter(c =>
                !addedIds.includes(c.id) && c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
    }, [searchQuery, allCollaborators, referenceFeedbackData]);

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

    const handleAddReference = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCollaborator || justification.trim() === '') {
            alert("Por favor, selecione um colaborador e escreva um feedback.");
            return;
        }

        addReferenceFeedback({
            referencedUserId: selectedCollaborator.id,
            referencedUserName: selectedCollaborator.name,
            justification: justification,
        });

        handleClearSelection();
    };

    return (
        <div className="flex flex-col flex-1">
            <main className="flex-1">
                <div className="mb-6">
                    <div className="max-w mx-auto relative">
                        <h2 className="text-lg font-semibold mb-2">Adicionar Referência ({referenceFeedbackData.length}/{totalEvaluations})</h2>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        <SearchResults
                            results={filteredResults}
                            onSelect={handleSelectCollaborator}
                            isLoading={isLoading && searchQuery.length > 0}
                        />
                    </div>

                    {selectedCollaborator && (
                        <form onSubmit={handleAddReference} className='block w-full mt-4 p-6 rounded-2xl bg-white shadow-lg'>
                            <div className='flex justify-between items-start pr-10'>
                                <div>
                                    <h1 className='mb-2 ml-30 font-semibold text-md'>{selectedCollaborator.name}</h1>
                                    <h2 className='mb-10 ml-32 font-semibold text-sm text-gray-700'>{selectedCollaborator.role}</h2>
                                </div>
                                <button type="button" onClick={handleClearSelection} className='text-gray-400 hover:text-red-500 font-bold text-2xl px-2' title='Remover seleção'>
                                    &times;
                                </button>
                            </div>

                            <div className='mt-5 flex flex-col items-center'>
                                <textarea
                                    placeholder={`Escreva seu feedback sobre ${selectedCollaborator.name}...`}
                                    rows={3}
                                    className='block w-full max-w-2xl p-3 rounded-lg border border-gray-300 sm:text-sm resize-none'
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <button type="submit" className="mt-4 bg-[#085F60] text-white font-medium text-sm py-2 px-6 rounded-sm hover:bg-[#086014d5]">
                                    Adicionar Feedback
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <hr />
                <h2 className="text-lg font-semibold mt-6 mb-2">Referências Adicionadas</h2>
                <div className="space-y-4">
                    {referenceFeedbackData.length > 0 ? (
                        referenceFeedbackData.map(feedback => (
                            <div key={feedback.referencedUserId} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{feedback.referencedUserName}</p>
                                    <p className="text-sm text-gray-600 mt-1 italic">"{feedback.justification}"</p>
                                </div>
                                <button onClick={() => removeReferenceFeedback(feedback.referencedUserId)} className="text-red-500 hover:text-red-700 font-semibold">
                                    Remover
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhum feedback de referência foi adicionado ainda.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RefCollaborator;