// Representa um único liderado na tabela do dashboard
interface DashboardSubordinate {
  id: string;
  name: string;
  initials: string;
  jobTitle: string;
  status: 'PENDING' | 'DRAFT' | 'SUBMITTED'; // Usando tipos literais para segurança
  selfAssessmentScore: number | null;
  managerScore: number | null;
}

// Representa um grupo de projeto com seus liderados
interface DashboardProjectGroup {
  projectId: string;
  projectName: string;
  subordinates: DashboardSubordinate[];
}

// Representa os dados para os 3 cards de resumo
interface DashboardSummary {
  overallScore: number | null;
  completionPercentage: number;
  incompleteReviews: number;
}

// A resposta completa do endpoint principal do dashboard
interface ManagerDashboardResponse {
  summary: DashboardSummary;
  collaboratorsInfo: DashboardProjectGroup[];
}

// A resposta do endpoint que busca o ciclo ativo
interface ActiveCycle {
  id: string;
  name: string;
  status: 'UPCOMING' | 'OPEN' | 'EQUALIZATION' | 'CLOSED';
  phase: 'ASSESSMENTS' | 'MANAGER_REVIEWS' | 'EQUALIZATION';
  startDate: string | null;
  endDate: string | null;
}

interface Received360Evaluation {
  evaluatorName: string;
  evaluatorJobTitle: string;
  rating: number;
  strengths: string;
  weaknesses: string;
}
