import React, { useEffect, useState } from 'react';
import { type SelfAssessmentResponse } from '../../../services/EvaluationService';
import SelfEvaluationCard from './SelfEvaluationCard';
import { useEvaluation } from '../../../contexts/EvaluationProvider';
import { useAuth } from '../../../hooks/useAuth';
import CriteriaService, { type Criterion } from '../../../services/CriteriaService';

interface CriteriaCardProps {
  title: string;
  filledCount: number;
  totalCount: number;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  children: React.ReactNode;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({
  title,
  filledCount,
  totalCount,
  isMinimized,
  onToggleMinimize,
  children
}) => {
  const progressText = 'preenchidos';
  
  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer"
        onClick={onToggleMinimize}
      >
        <h3 className="m-0 text-lg font-semibold text-[#08605F]">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium rounded-[5px] px-3 py-1 ${
            filledCount === 0
              ? 'bg-[#F33E3E40] text-[#F33E3E]'
              : 'bg-[#24A19F40] text-[#24A19F]'
          }`}>
            {filledCount}/{totalCount} {progressText}
          </span>
          <div className={`text-gray-400 transition-transform duration-200 ${
            isMinimized ? 'rotate-0' : 'rotate-180'
          }`}>
            ▼
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

interface SelfEvaluationProps {
  initialSelfAssessmentData: SelfAssessmentResponse | null;
  cycleId: string;
  onSubmissionSuccess?: () => void; 
}

// Utilitário para agrupar critérios por pilar
function groupCriteriaByPillar(criteria: Criterion[]) {
  return criteria.reduce((acc, criterion) => {
    if (!acc[criterion.pillar]) acc[criterion.pillar] = [];
    acc[criterion.pillar].push(criterion);
    return acc;
  }, {} as Record<string, Criterion[]>);
}

const pillarLabels: Record<string, string> = {
  BEHAVIOR: 'Critérios de Postura',
  EXECUTION: 'Critérios de Execução',
  MANAGEMENT: 'Critérios de Gente e Gestão',
};

// Mapeamento manual dos ids dos critérios para as chaves camelCase do backend
const CRITERION_ID_TO_BACKEND_KEY: Record<string, string> = {
  'sentimento-de-dono': 'sentimentoDeDono',
  'resiliencia-adversidades': 'resilienciaNasAdversidades',
  'organizacao-trabalho': 'organizacaoNoTrabalho',
  'capacidade-aprender': 'capacidadeDeAprender',
  'team-player': 'serTeamPlayer',
  'entregar-qualidade': 'entregarComQualidade',
  'atender-prazos': 'atenderAosPrazos',
  'fazer-mais-menos': 'fazerMaisComMenos',
  'pensar-fora-caixa': 'pensarForaDaCaixa',
  'gestao-gente': 'gente',
  'gestao-resultados': 'resultados',
  'evolucao-rocket-corp': 'evolucaoDaRocketCorp',
};

const SelfEvaluation: React.FC<SelfEvaluationProps> = ({
  initialSelfAssessmentData,
}) => {
  const { user } = useAuth();
  const [userCriteria, setUserCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado local para respostas dos critérios dinâmicos
  const [answers, setAnswers] = useState<Record<string, { score: number | null; justification: string }>>({});

  const {
    selfEvaluationData,
    updateSelfEvaluationCriterion,
    toggleSelfEvaluationCard,
    toggleSelfEvaluationItem,
  } = useEvaluation();

  const { cardStates, expandedItems } = selfEvaluationData;

  // Carregar critérios específicos da área do usuário
  useEffect(() => {
    const loadUserCriteria = async () => {
      if (!user?.businessUnit) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const criteria = await CriteriaService.getEffectiveCriteriaForUser(user.businessUnit);
        setUserCriteria(criteria);
      } catch (err) {
        setError('Erro ao carregar critérios da sua área');
      } finally {
        setLoading(false);
      }
    };
    loadUserCriteria();
  }, [user?.businessUnit]);

  // Carregar dados iniciais da autoavaliação (mantém funcionamento atual)
  useEffect(() => {
    if (initialSelfAssessmentData) {
      (window as any).isLoadingInitialData = true;
      // Mantém lógica de preenchimento automático dos campos existentes
      // (pode ser ajustado para preencher dinamicamente se necessário)
      setTimeout(() => {
        (window as any).isLoadingInitialData = false;
      }, 500);
    }
  }, [initialSelfAssessmentData]);

  // Preencher respostas com dados do banco quando initialSelfAssessmentData e critérios estiverem disponíveis
  useEffect(() => {
    if (!initialSelfAssessmentData || userCriteria.length === 0) return;

    // LOGS DE DIAGNÓSTICO
    console.log('🔎 [DEBUG] Dados do banco (initialSelfAssessmentData):', initialSelfAssessmentData);
    console.log('🔎 [DEBUG] Critérios carregados (userCriteria):', userCriteria);

    const normalize = (str: string) => str?.replace(/[_\s]/g, '-').toLowerCase();

    const newAnswers: Record<string, { score: number | null; justification: string }> = {};

    userCriteria.forEach((criterion) => {
      let found = null;
      if ((initialSelfAssessmentData as any).answers) {
        found = (initialSelfAssessmentData as any).answers.find((a: any) => {
          return normalize(a.criterionId) === normalize(criterion.id);
        });
      } else {
        const groupMap: Record<string, any> = {
          BEHAVIOR: (initialSelfAssessmentData as any).postureCriteria,
          EXECUTION: (initialSelfAssessmentData as any).executionCriteria,
          MANAGEMENT: (initialSelfAssessmentData as any).peopleAndManagementCriteria,
        };
        const group = groupMap[criterion.pillar];
        if (group) {
          const possibleKeys = [
            criterion.id,
            CRITERION_ID_TO_BACKEND_KEY[criterion.id],
            normalize(criterion.id),
            normalize(criterion.id).replace(/-/g, ''),
            normalize(criterion.id).replace(/-/g, '_'),
            normalize(criterion.id).replace(/-/g, ''),
            toCamelCase(criterion.id),
            toSnakeCase(criterion.id),
            toKebabCase(criterion.id),
            kebabToCamel(criterion.id),
          ].filter(Boolean); // Remove undefined
          // LOG DETALHADO
          console.log(`🔍 Critério: ${criterion.id} | Pilar: ${criterion.pillar}`);
          console.log('  Chaves disponíveis no grupo:', Object.keys(group));
          console.log('  Chaves tentadas:', possibleKeys);
          for (const key of possibleKeys) {
            if (group[key]) {
              found = group[key];
              console.log(`  ✅ Encontrado! Usando chave: ${key}`);
              break;
            }
          }
        } else {
          console.log(`❌ Grupo não encontrado para pilar: ${criterion.pillar}`);
        }
      }
      newAnswers[criterion.id] = {
        score: found?.score ?? null,
        justification: found?.justification ?? '',
      };
    });
    console.log('🔎 [DEBUG] Respostas mapeadas para os critérios:', newAnswers);
    setAnswers(newAnswers);
  }, [initialSelfAssessmentData, userCriteria]);

  // Handler para atualizar resposta
  const handleAnswerChange = (criterion: Criterion, field: 'score' | 'justification', value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [criterion.id]: {
        ...prev[criterion.id],
        [field]: value,
      },
    }));
    // Também atualiza no contexto para manter auto-save
    // O grupo é definido pelo pilar
    let group: 'posture' | 'execution' | 'peopleAndManagement' = 'posture';
    if (criterion.pillar === 'EXECUTION') group = 'execution';
    if (criterion.pillar === 'MANAGEMENT') group = 'peopleAndManagement';
    updateSelfEvaluationCriterion(group, criterion.id, field, value);
  };

  // Contagem de preenchidos por pilar
  const grouped = groupCriteriaByPillar(userCriteria);
  const getFilledCount = (pillar: string) =>
    (grouped[pillar] || []).filter(
      (c) => answers[c.id]?.score !== null && answers[c.id]?.justification.trim() !== ''
    ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085F60]"></div>
        <span className="ml-3 text-gray-600">Carregando critérios da sua área...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 md:px-4 lg:px-8">
      {Object.entries(grouped).map(([pillar, criteriaList]) => (
        <CriteriaCard
          key={pillar}
          title={pillarLabels[pillar] || pillar}
          filledCount={getFilledCount(pillar)}
          totalCount={criteriaList.length}
          isMinimized={cardStates[pillar.toLowerCase() as 'posture' | 'execution' | 'peopleAndManagement']}
          onToggleMinimize={() => toggleSelfEvaluationCard(pillar.toLowerCase() as 'posture' | 'execution' | 'peopleAndManagement')}
        >
          {criteriaList.map((criterion, idx) => (
            <SelfEvaluationCard
              key={criterion.id}
              number={idx + 1}
              title={criterion.name}
              score={answers[criterion.id]?.score ?? null}
              justification={answers[criterion.id]?.justification ?? ''}
              onScoreChange={(s) => handleAnswerChange(criterion, 'score', s)}
              onJustificationChange={(j) => handleAnswerChange(criterion, 'justification', j)}
              isExpanded={expandedItems[`${pillar.toLowerCase()}-${criterion.id}`] || false}
              onToggleExpand={() => toggleSelfEvaluationItem(`${pillar.toLowerCase()}-${criterion.id}`)}
              isFilled={answers[criterion.id]?.score !== null && answers[criterion.id]?.justification.trim() !== ''}
            />
          ))}
        </CriteriaCard>
      ))}
    </div>
  );
};

export default SelfEvaluation;

// Funções utilitárias para normalização de chaves
function toCamelCase(str: string) {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}
function toSnakeCase(str: string) {
  return str.replace(/-/g, '_');
}
function toKebabCase(str: string) {
  return str.replace(/_/g, '-');
}
function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}