import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  Filter,
  Download,
  RefreshCw,
  LineChart,
  PieChart,
  Target,
  Calendar,
  Award,
  Activity,
  Info,
  HelpCircle,
  X,
  Minus,
  ChevronDown
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../types/roles';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProgressBar from '../../components/ProgressBar';
import CollaboratorEvolutionModal from '../../components/modals/CollaboratorEvolutionModal';
import useHistoricalEvolution from '../../hooks/useHistoricalEvolution';
import type { Highlight } from '../../types/evaluations';
import HRService from '../../services/HRService';
import { toast } from 'react-hot-toast';

interface EvolutionDashboard {
  organizationStats: {
    totalCollaborators: number;
    collaboratorsWithHistory: number;
    currentOverallAverage: number;
    previousOverallAverage: number;
    organizationGrowthPercentage: number;
  };
  performanceDistribution: {
    highPerformers: number;
    solidPerformers: number;
    developing: number;
    critical: number;
    percentages: {
    highPerformers: number;
    solidPerformers: number;
    developing: number;
    critical: number;
    };
  };
  trendAnalysis: {
    improving: number;
    declining: number;
    stable: number;
    fastestGrowingPillar: string;
    pillarNeedingAttention: string;
  };
  highlights: Highlight[];
  lastUpdated: string;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
const PILLAR_COLORS = {
  BEHAVIOR: '#3B82F6',
  EXECUTION: '#10B981', 
  MANAGEMENT: '#8B5CF6'
};

const PERFORMANCE_RANGES = {
  'high-performer': { min: 4.5, max: 5.0, label: 'Alto Desempenho', color: 'text-green-600' },
  'solid-performer': { min: 3.5, max: 4.49, label: 'Desempenho Sólido', color: 'text-blue-600' },
  'developing': { min: 2.5, max: 3.49, label: 'Em Desenvolvimento', color: 'text-yellow-600' },
  'critical': { min: 0, max: 2.49, label: 'Crítico', color: 'text-red-600' }
};

const PILLAR_INFO = {
  BEHAVIOR: {
    name: 'Comportamento',
    description: 'Avalia soft skills, relacionamento interpessoal, comunicação, trabalho em equipe e alinhamento cultural',
    color: '#3B82F6'
  },
  EXECUTION: {
    name: 'Execução',
    description: 'Mede qualidade das entregas, cumprimento de prazos, produtividade e resultados técnicos',
    color: '#10B981'
  },
  MANAGEMENT: {
    name: 'Gestão',
    description: 'Analisa liderança, tomada de decisão, planejamento estratégico e desenvolvimento de pessoas',
    color: '#8B5CF6'
  }
};

interface CriterionEvolution {
  id: string;
  name: string;
  pillar: string;
  cycles: {
    cycle: string;
    selfAverage: number;
    managerAverage: number;
    finalAverage: number;
    participationCount: number;
  }[];
}

interface OrganizationalTrends {
  criteriaEvolution: CriterionEvolution[];
  pillarsEvolution: {
    pillar: string;
    cycles: {
      cycle: string;
      average: number;
      participationCount: number;
    }[];
  }[];
  overallTrends: {
    cycle: string;
    overallAverage: number;
    totalParticipants: number;
  }[];
}

const HistoricalEvolution: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    dashboard,
    collaborators,
    collaboratorDetails,
    loading,
    error,
    loadDashboard,
    loadCollaborators,
    clearError,
    getCollaboratorDetails
  } = useHistoricalEvolution();
  
  const [selectedView, setSelectedView] = useState<'dashboard' | 'collaborators'>('dashboard');
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar' | 'area'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'self' | 'manager' | 'committee' | '360'>('all');
  const [selectedPillar, setSelectedPillar] = useState<'all' | 'BEHAVIOR' | 'EXECUTION' | 'MANAGEMENT'>('all');
  const [criteriaViewType, setCriteriaViewType] = useState<'summary' | 'evolution'>('evolution');
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '1year' | '2years'>('all');
  const [filters, setFilters] = useState({
    sortBy: 'latestScore',
    sortOrder: 'desc' as 'asc' | 'desc',
    filterBy: '',
    businessUnit: 'all',
    seniority: 'all',
    performanceCategory: 'all'
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    collaboratorId: '',
    collaboratorName: ''
  });
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user?.roles.includes(ROLES.RH)) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (selectedView === 'dashboard') {
      loadDashboard();
    }
  }, [selectedView, loadDashboard]);

  useEffect(() => {
    if (selectedView === 'collaborators') {
      loadCollaborators(filters);
    }
  }, [selectedView, filters, loadCollaborators]);

  useEffect(() => {
    if (selectedCollaborator) {
      getCollaboratorDetails(selectedCollaborator);
    }
  }, [selectedCollaborator, getCollaboratorDetails]);

  const handleRefresh = () => {
    clearError();
    if (selectedView === 'dashboard') {
      loadDashboard();
    } else {
      loadCollaborators(filters);
    }
  };

  const openModal = async (collaboratorId: string, collaboratorName: string) => {
    setModalState({
      isOpen: true,
      collaboratorId,
      collaboratorName
    });
    await getCollaboratorDetails(collaboratorId);
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      collaboratorId: '',
      collaboratorName: ''
    });
  };

  // Preparar dados para os gráficos
  const prepareChartData = () => {
    if (!collaboratorDetails) return [];

    const cycleData = collaboratorDetails.cycleDetails?.map(cycle => ({
      cycle: cycle.cycle,
      autoavaliacao: cycle.selfAssessmentScore || 0,
      gestor: cycle.managerAssessmentScore || 0,
      comite: cycle.committeeAssessmentScore || 0,
      media: ((cycle.selfAssessmentScore || 0) + (cycle.managerAssessmentScore || 0) + (cycle.committeeAssessmentScore || 0)) / 3
    })) || [];

    return cycleData.reverse(); // Mostrar cronologicamente
  };

  const preparePillarData = () => {
    if (!collaboratorDetails?.pillarEvolution) return [];

    return collaboratorDetails.pillarEvolution.map(pillar => ({
      pillar: pillar.pillar === 'BEHAVIOR' ? 'Comportamento' : 
              pillar.pillar === 'EXECUTION' ? 'Execução' : 'Gestão',
      average: pillar.average || 0,
      trend: pillar.trend,
      fullMark: 5
    }));
  };

  const preparePerformanceDistribution = () => {
    if (!dashboard?.performanceDistribution) return [];

    return [
      { name: 'Alto Desempenho', value: dashboard.performanceDistribution.highPerformers, color: COLORS[0] },
      { name: 'Desempenho Sólido', value: dashboard.performanceDistribution.solidPerformers, color: COLORS[1] },
      { name: 'Em Desenvolvimento', value: dashboard.performanceDistribution.developing, color: COLORS[2] },
      { name: 'Crítico', value: dashboard.performanceDistribution.critical, color: COLORS[3] }
    ];
  };

  // Nova função para preparar dados de evolução de critérios ao longo do tempo
  const prepareCriteriaEvolutionData = () => {
    if (!collaboratorDetails?.criteriaEvolution) return [];

    // Agrupar critérios por ciclo para mostrar evolução temporal
    const criteriaMap = new Map();
    
    collaboratorDetails.criteriaEvolution.forEach(criterion => {
      const key = criterion.description;
      if (!criteriaMap.has(key)) {
        criteriaMap.set(key, {
          name: criterion.description.length > 25 ? criterion.description.substring(0, 25) + '...' : criterion.description,
          fullName: criterion.description,
          pillar: criterion.pillar,
          cycles: []
        });
      }
      
      // Adicionar dados do ciclo atual (se existir)
      if (collaboratorDetails.cycleDetails) {
        collaboratorDetails.cycleDetails.forEach(cycle => {
          criteriaMap.get(key).cycles.push({
            cycle: cycle.cycle,
            autoavaliacao: criterion.selfAverage || 0,
            gestor: criterion.managerAverage || 0,
            comite: criterion.committeeAverage || 0
          });
        });
      }
    });

    return Array.from(criteriaMap.values());
  };

  const prepareCriteriaEvolution = () => {
    if (!collaboratorDetails?.criteriaEvolution) return [];

    return collaboratorDetails.criteriaEvolution.map(criterion => ({
      name: criterion.description.substring(0, 20) + '...',
      fullName: criterion.description,
      autoavaliacao: criterion.selfAverage,
      gestor: criterion.managerAverage,
      comite: criterion.committeeAverage,
      pillar: criterion.pillar
    }));
  };

  // Nova função para renderizar gráfico de evolução de critérios
  const renderCriteriaEvolutionChart = () => {
    if (!selectedCollaborator || !collaboratorDetails?.cycleDetails) return null;

    // Preparar dados usando cycleDetails para mostrar evolução real por ciclo
    const cycleData = collaboratorDetails.cycleDetails.map(cycle => {
      const result: any = { cycle: cycle.cycle };
      
      // Organizar critérios por pilar para este ciclo específico
      const criteriaByPillar = cycle.criteria.reduce((acc, criterion) => {
        if (!acc[criterion.pillar]) acc[criterion.pillar] = [];
        acc[criterion.pillar].push(criterion);
        return acc;
      }, {} as any);

      // Calcular médias por pilar para este ciclo
      Object.entries(criteriaByPillar).forEach(([pillar, criteria]) => {
        if (selectedPillar === 'all' || selectedPillar === pillar) {
          const pillarName = pillar === 'BEHAVIOR' ? 'Comportamento' : 
                           pillar === 'EXECUTION' ? 'Execução' : 'Gestão';
          
          const criteriaArray = criteria as any[];
          
          // Calcular média de autoavaliação para este pilar neste ciclo (tratar null como 0)
          const selfScores = criteriaArray.map(c => c.selfScore ?? 0);
          const selfAvg = selfScores.length > 0 
            ? selfScores.reduce((sum, score) => sum + score, 0) / selfScores.length 
            : 0;

          // Calcular média de avaliação do gestor para este pilar neste ciclo (tratar null como 0)
          const managerScores = criteriaArray.map(c => c.managerScore ?? 0);
          const managerAvg = managerScores.length > 0 
            ? managerScores.reduce((sum, score) => sum + score, 0) / managerScores.length 
            : 0;

          result[`${pillarName}_Autoavaliacao`] = selfAvg;
          result[`${pillarName}_Gestor`] = managerAvg;
        }
      });

      return result;
    });

    const reversedData = cycleData.reverse(); // Mostrar cronologicamente

    return (
      <ResponsiveContainer width="100%" height={500}>
        <RechartsLineChart data={reversedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cycle" />
          <YAxis domain={[0, 5]} />
          <Tooltip 
            formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
            labelFormatter={(label) => `Ciclo: ${label}`}
          />
          <Legend />
          
          {/* Renderizar linhas baseadas no pilar selecionado */}
          {(selectedPillar === 'all' || selectedPillar === 'BEHAVIOR') && [
            <Line 
              key="behavior-self" 
              type="monotone" 
              dataKey="Comportamento_Autoavaliacao" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              name="Comportamento - Autoavaliação" 
              strokeDasharray="none"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />,
            <Line 
              key="behavior-manager" 
              type="monotone" 
              dataKey="Comportamento_Gestor" 
              stroke="#1E40AF" 
              strokeWidth={2} 
              name="Comportamento - Gestor" 
              strokeDasharray="5 5"
              dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
            />
          ]}
          
          {(selectedPillar === 'all' || selectedPillar === 'EXECUTION') && [
            <Line 
              key="execution-self" 
              type="monotone" 
              dataKey="Execução_Autoavaliacao" 
              stroke="#10B981" 
              strokeWidth={2} 
              name="Execução - Autoavaliação" 
              strokeDasharray="none"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />,
            <Line 
              key="execution-manager" 
              type="monotone" 
              dataKey="Execução_Gestor" 
              stroke="#047857" 
              strokeWidth={2} 
              name="Execução - Gestor" 
              strokeDasharray="5 5"
              dot={{ fill: '#047857', strokeWidth: 2, r: 4 }}
            />
          ]}
          
          {(selectedPillar === 'all' || selectedPillar === 'MANAGEMENT') && [
            <Line 
              key="management-self" 
              type="monotone" 
              dataKey="Gestão_Autoavaliacao" 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              name="Gestão - Autoavaliação" 
              strokeDasharray="none"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />,
            <Line 
              key="management-manager" 
              type="monotone" 
              dataKey="Gestão_Gestor" 
              stroke="#6D28D9" 
              strokeWidth={2} 
              name="Gestão - Gestor" 
              strokeDasharray="5 5"
              dot={{ fill: '#6D28D9', strokeWidth: 2, r: 4 }}
            />
          ]}
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  // Nova função para preparar dados de evolução por critério específico
  const prepareCriteriaEvolutionByCriterion = () => {
    if (!collaboratorDetails?.cycleDetails) return { behavior: [], execution: [] };

    // Mapear critérios únicos por pilar
    const criteriaMap = new Map();
    
    collaboratorDetails.cycleDetails.forEach(cycle => {
      cycle.criteria.forEach(criterion => {
        if (!criteriaMap.has(criterion.id)) {
          criteriaMap.set(criterion.id, {
            id: criterion.id,
            description: criterion.description,
            pillar: criterion.pillar,
            cycles: []
          });
        }
      });
    });

    // Preparar dados por ciclo para cada critério
    const criteriaData = Array.from(criteriaMap.values());
    
    criteriaData.forEach(criterion => {
      collaboratorDetails.cycleDetails.forEach(cycle => {
        const criterionInCycle = cycle.criteria.find(c => c.id === criterion.id);
        if (criterionInCycle) {
          const selfScore = criterionInCycle.selfScore ?? 0;
          const managerScore = criterionInCycle.managerScore ?? 0;
          const averageScore = (selfScore + managerScore) / 2;
          
          criterion.cycles.push({
            cycle: cycle.cycle,
            score: averageScore
          });
        } else {
          criterion.cycles.push({
            cycle: cycle.cycle,
            score: 0
          });
        }
      });
    });

    // Separar por pilares
    const behaviorCriteria = criteriaData.filter(c => c.pillar === 'BEHAVIOR');
    const executionCriteria = criteriaData.filter(c => c.pillar === 'EXECUTION');

    return { behavior: behaviorCriteria, execution: executionCriteria };
  };

  // Função para renderizar gráfico de evolução por critério específico
  const renderCriteriaEvolutionByCriterion = () => {
    const { behavior, execution } = prepareCriteriaEvolutionByCriterion();
    
    if (!behavior.length && !execution.length) return null;

    // Preparar dados para o gráfico
    const allCycles = collaboratorDetails?.cycleDetails?.map(c => c.cycle).reverse() || [];
    
    const behaviorChartData = allCycles.map(cycle => {
      const dataPoint: any = { cycle };
             behavior.forEach(criterion => {
         const cycleData = criterion.cycles.find((c: any) => c.cycle === cycle);
         dataPoint[criterion.description] = cycleData?.score || 0;
       });
      return dataPoint;
    });

    const executionChartData = allCycles.map(cycle => {
      const dataPoint: any = { cycle };
             execution.forEach(criterion => {
         const cycleData = criterion.cycles.find((c: any) => c.cycle === cycle);
         dataPoint[criterion.description] = cycleData?.score || 0;
       });
      return dataPoint;
    });

    const behaviorColors = ['#3B82F6', '#1E40AF', '#1E3A8A', '#312E81', '#1F2937'];
    const executionColors = ['#10B981', '#047857', '#065F46', '#064E3B', '#022C22'];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Comportamento */}
        {behavior.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Evolução - Critérios de Comportamento
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              Média entre autoavaliação e avaliação do gestor por ciclo
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsLineChart data={behaviorChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" fontSize={11} />
                <YAxis domain={[0, 5]} fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
                  labelFormatter={(label) => `Ciclo: ${label}`}
                />
                <Legend />
                {behavior.map((criterion, index) => (
                  <Line
                    key={criterion.id}
                    type="monotone"
                    dataKey={criterion.description}
                    stroke={behaviorColors[index % behaviorColors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={criterion.id}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
        </div>
        )}

        {/* Gráfico de Execução */}
        {execution.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Evolução - Critérios de Execução
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              Média entre autoavaliação e avaliação do gestor por ciclo
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsLineChart data={executionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" fontSize={11} />
                <YAxis domain={[0, 5]} fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
                  labelFormatter={(label) => `Ciclo: ${label}`}
                />
                <Legend />
                {execution.map((criterion, index) => (
                  <Line
                    key={criterion.id}
                    type="monotone"
                    dataKey={criterion.description}
                    stroke={executionColors[index % executionColors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={criterion.id}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderEvolutionChart = () => {
    const data = prepareChartData();
    if (!data.length) return null;

    const commonProps = {
      width: '100%',
      height: 400,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              {selectedMetric === 'all' || selectedMetric === 'self' ? (
                <Line type="monotone" dataKey="autoavaliacao" stroke="#3B82F6" strokeWidth={2} name="Autoavaliação" />
              ) : null}
              {selectedMetric === 'all' || selectedMetric === 'manager' ? (
                <Line type="monotone" dataKey="gestor" stroke="#8B5CF6" strokeWidth={2} name="Gestor" />
              ) : null}
              {selectedMetric === 'all' || selectedMetric === 'committee' ? (
                <Line type="monotone" dataKey="comite" stroke="#10B981" strokeWidth={2} name="Comitê" />
              ) : null}
              <Line type="monotone" dataKey="media" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" name="Média" />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="autoavaliacao" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Autoavaliação" />
              <Area type="monotone" dataKey="gestor" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Gestor" />
              <Area type="monotone" dataKey="comite" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Comitê" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="autoavaliacao" fill="#3B82F6" name="Autoavaliação" />
              <Bar dataKey="gestor" fill="#8B5CF6" name="Gestor" />
              <Bar dataKey="comite" fill="#10B981" name="Comitê" />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = preparePillarData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="pillar" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} />
              <Radar name="Desempenho" dataKey="average" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderCriteriaChart = () => {
    const data = prepareCriteriaEvolution();
    if (!data.length) return null;

    const filteredData = selectedPillar === 'all' ? data : data.filter(item => item.pillar === selectedPillar);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={120} 
            fontSize={11}
            interval={0}
          />
          <YAxis domain={[0, 5]} />
          <Tooltip 
            formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
            labelFormatter={(label) => {
              const item = filteredData.find(d => d.name === label);
              return item?.fullName || label;
            }}
          />
          <Legend />
          <Bar dataKey="autoavaliacao" fill="#3B82F6" name="Autoavaliação" />
          <Bar dataKey="gestor" fill="#8B5CF6" name="Gestor" />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  const renderPerformanceDistribution = () => {
    const data = preparePerformanceDistribution();
    if (!data.length) return null;

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
      cx, cy, midAngle, innerRadius, outerRadius, percent
    }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name: any) => [value, name]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  // Componente para tooltip informativo
  const InfoTooltip = ({ content, children }: { content: string; children: React.ReactNode }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="cursor-help"
        >
          {children}
                  </div>
        {showTooltip && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
        )}
                    </div>
    );
  };

  // Componente para modal de informações detalhadas
  const PerformanceInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Guia de Avaliação</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
                    </div>
          
          <div className="p-6 space-y-6">
            {/* Faixas de Performance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Faixas de Performance</h3>
              <div className="space-y-3">
                {Object.entries(PERFORMANCE_RANGES).map(([key, range]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        key === 'high-performer' ? 'bg-green-500' :
                        key === 'solid-performer' ? 'bg-blue-500' :
                        key === 'developing' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{range.label}</span>
                  </div>
                    <span className="text-sm text-gray-600">
                      {range.min} - {range.max}
                    </span>
                </div>
              ))}
            </div>
            </div>

            {/* Pilares de Avaliação */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilares de Avaliação</h3>
              <div className="space-y-4">
                {Object.entries(PILLAR_INFO).map(([key, pillar]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: pillar.color }}
                      ></div>
                      <h4 className="font-medium text-gray-900">{pillar.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{pillar.description}</p>
          </div>
        ))}
      </div>
            </div>

            {/* Tipos de Avaliação */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Avaliação</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">Autoavaliação</div>
                  <div className="text-sm text-blue-700">Avaliação feita pelo próprio colaborador</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">Avaliação do Gestor</div>
                  <div className="text-sm text-purple-700">Avaliação feita pelo gestor direto</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">Nota Final (Comitê)</div>
                  <div className="text-sm text-green-700">Nota equalizada após análise do comitê de avaliação</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Evolução</h1>
          <p className="text-gray-600">Análise visual detalhada da evolução dos colaboradores</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setSelectedView('collaborators')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'collaborators'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Colaboradores
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {selectedView === 'dashboard' && dashboard && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Colaboradores</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.organizationStats.totalCollaborators}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Média Atual</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.organizationStats.currentOverallAverage.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {dashboard.organizationStats.organizationGrowthPercentage > 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${dashboard.organizationStats.organizationGrowthPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(dashboard.organizationStats.organizationGrowthPercentage).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Evolução</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.trendAnalysis.improving}</p>
                  <p className="text-sm text-gray-500">colaboradores</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alto Desempenho</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.performanceDistribution.highPerformers}</p>
                  <p className="text-sm text-gray-500">{dashboard.performanceDistribution.percentages?.highPerformers?.toFixed(1) || '0'}%</p>
                </div>
              </div>
            </div>
          </div>

            {/* Distribuição de Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribuição de Performance</h3>
              <InfoTooltip content="Clique no ícone de informação para ver detalhes das faixas">
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </InfoTooltip>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {renderPerformanceDistribution()}
              </div>
              <div className="space-y-4">
                <InfoTooltip content="Colaboradores com média ≥ 4.5">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Alto Desempenho</span>
                      <Info className="w-4 h-4 ml-2 text-gray-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">{dashboard.performanceDistribution.highPerformers}</span>
                      <div className="text-xs text-gray-500">≥ 4.5</div>
                  </div>
                </div>
                </InfoTooltip>
                
                <InfoTooltip content="Colaboradores entre 3.5 - 4.49">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">Desempenho Sólido</span>
                      <Info className="w-4 h-4 ml-2 text-gray-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">{dashboard.performanceDistribution.solidPerformers}</span>
                      <div className="text-xs text-gray-500">3.5 - 4.49</div>
                  </div>
                </div>
                </InfoTooltip>
                
                <InfoTooltip content="Colaboradores entre 2.5 - 3.49">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium">Em Desenvolvimento</span>
                      <Info className="w-4 h-4 ml-2 text-gray-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-yellow-600">{dashboard.performanceDistribution.developing}</span>
                      <div className="text-xs text-gray-500">2.5 - 3.49</div>
                  </div>
                </div>
                </InfoTooltip>
                
                <InfoTooltip content="Colaboradores com média < 2.5">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-medium">Crítico</span>
                      <Info className="w-4 h-4 ml-2 text-gray-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600">{dashboard.performanceDistribution.critical}</span>
                      <div className="text-xs text-gray-500">&lt; 2.5</div>
                  </div>
                  </div>
                </InfoTooltip>
                </div>
              </div>
            </div>

            {/* Análise de Tendências */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
              <InfoTooltip content="Análise baseada na evolução histórica dos colaboradores">
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </InfoTooltip>
                  </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{dashboard.trendAnalysis.improving}</p>
                <p className="text-sm text-gray-600">Melhorando</p>
                </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-600">{dashboard.trendAnalysis.stable}</p>
                <p className="text-sm text-gray-600">Estável</p>
                  </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{dashboard.trendAnalysis.declining}</p>
                <p className="text-sm text-gray-600">Declinando</p>
                </div>
                  </div>
            
            {dashboard.trendAnalysis.fastestGrowingPillar && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center flex-wrap">
                  <span className="font-medium text-blue-700">Pilar em Destaque:</span>
                  <InfoTooltip content={PILLAR_INFO[dashboard.trendAnalysis.fastestGrowingPillar as keyof typeof PILLAR_INFO]?.description || ''}>
                    <div className="flex items-center ml-2">
                      <span className="text-blue-800 font-semibold">
                        {PILLAR_INFO[dashboard.trendAnalysis.fastestGrowingPillar as keyof typeof PILLAR_INFO]?.name || dashboard.trendAnalysis.fastestGrowingPillar}
                      </span>
                      <Info className="w-4 h-4 ml-1 text-blue-500" />
                </div>
                  </InfoTooltip>
                  <span className="ml-2 text-blue-700">está apresentando o maior crescimento</span>
              </div>
            </div>
            )}
          </div>

          {/* Highlights */}
          {dashboard.highlights && dashboard.highlights.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destaques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboard.highlights.slice(0, 4).map((highlight: Highlight, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{highlight.title}</h4>
                    <p className="text-sm text-gray-600">{highlight.description}</p>
                    {highlight.value && (
                      <p className="text-sm font-medium text-blue-600 mt-2">
                        {typeof highlight.value === 'number' ? `${highlight.value.toFixed(1)}%` : highlight.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collaborators View */}
      {selectedView === 'collaborators' && (
        <div className="space-y-6">
          {/* Filtros e Seleção de Colaborador */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colaborador</label>
                <select
                  value={selectedCollaborator}
                  onChange={(e) => setSelectedCollaborator(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um colaborador</option>
                  {collaborators?.map(collaborator => (
                    <option key={collaborator.collaboratorId} value={collaborator.collaboratorId}>
                      {collaborator.name} - {collaborator.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="line">Linha</option>
                  <option value="area">Área</option>
                  <option value="bar">Barras</option>
                  <option value="radar">Radar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Métrica</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="self">Autoavaliação</option>
                  <option value="manager">Gestor</option>
                  <option value="committee">Comitê</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilar
                  <InfoTooltip content="Filtre por pilar específico de avaliação">
                    <Info className="w-4 h-4 inline ml-1 text-gray-400" />
                  </InfoTooltip>
                </label>
                <select
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="BEHAVIOR">Comportamento</option>
                  <option value="EXECUTION">Execução</option>
                  <option value="MANAGEMENT">Gestão</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gráfico Principal de Evolução */}
          {selectedCollaborator && collaboratorDetails && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Evolução de {collaboratorDetails.collaborator.name}
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderEvolutionChart()}
            </div>
          )}

          {/* Gráfico de Critérios */}
          {selectedCollaborator && collaboratorDetails && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Desempenho por Critérios
                  {selectedPillar !== 'all' && ` - ${selectedPillar === 'BEHAVIOR' ? 'Comportamento' : selectedPillar === 'EXECUTION' ? 'Execução' : 'Gestão'}`}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCriteriaViewType('evolution')}
                    className={`px-3 py-1 text-sm rounded ${
                      criteriaViewType === 'evolution' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Evolução Temporal
                  </button>
                  <button
                    onClick={() => setCriteriaViewType('summary')}
                    className={`px-3 py-1 text-sm rounded ${
                      criteriaViewType === 'summary' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Resumo Atual
                  </button>
                </div>
              </div>
              
              {criteriaViewType === 'evolution' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Visualize a evolução real das notas por pilar em cada ciclo de avaliação. 
                    Linhas sólidas = Autoavaliação, Linhas tracejadas = Avaliação do Gestor.
                    Valores ausentes são tratados como 0.
                  </p>
                  {renderCriteriaEvolutionChart()}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Evolução detalhada por critério específico ao longo dos ciclos. 
                    Cada linha representa um critério, mostrando a média entre autoavaliação e avaliação do gestor.
                  </p>
                  {renderCriteriaEvolutionByCriterion()}
                </div>
              )}
            </div>
          )}

          {/* Resumo Estatístico */}
          {selectedCollaborator && collaboratorDetails && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Ciclos</p>
                    <p className="text-2xl font-bold text-gray-900">{collaboratorDetails.summary.totalCycles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Média Histórica</p>
                    <p className="text-2xl font-bold text-gray-900">{collaboratorDetails.summary.historicalAverage?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Melhor Nota</p>
                    <p className="text-2xl font-bold text-gray-900">{collaboratorDetails.summary.bestScore?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Consistência</p>
                    <p className="text-2xl font-bold text-gray-900">{collaboratorDetails.summary.consistencyScore?.toFixed(0) || 'N/A'}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Colaboradores */}
          {!selectedCollaborator && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Lista de Colaboradores</h3>
                <p className="text-sm text-gray-600">Selecione um colaborador para ver sua evolução detalhada</p>
              </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Última Nota</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Média</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tendência</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {collaborators?.slice(0, 10).map((collaborator) => (
                    <tr key={collaborator.collaboratorId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                          <div className="text-sm text-gray-500">{collaborator.businessUnit}</div>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {collaborator.jobTitle}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">{collaborator.latestScore?.toFixed(2)}</span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">{collaborator.historicalAverage?.toFixed(2)}</span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            {collaborator.evolutionTrend.trend === 'improving' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : collaborator.evolutionTrend.trend === 'declining' ? (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            ) : (
                              <BarChart3 className="w-4 h-4 text-gray-600" />
                            )}
                            <span className="ml-1 text-sm text-gray-600">
                              {Math.abs(collaborator.evolutionTrend.percentageChange).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                            onClick={() => setSelectedCollaborator(collaborator.collaboratorId)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Modal de Informações */}
      <PerformanceInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* Modal */}
      <CollaboratorEvolutionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        collaboratorId={modalState.collaboratorId}
        collaboratorName={modalState.collaboratorName}
      />
    </div>
  );
};

export default HistoricalEvolution; 