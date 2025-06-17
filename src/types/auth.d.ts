// Credenciais necessárias para o login (LoginDto)
interface LoginCredentials {
  email: string;
  password: string;
}

// Informações básicas do usuário retornadas no login (UserInfoDto)
interface UserInfo {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Útil para quando você busca os detalhes completos do usuário em outras partes da aplicação
interface UserProfile extends UserInfo {
  jobTitle: string;
  seniority: string;
  businessUnit: string;
  // Adicione quaisquer outros campos que seu getProfile() possa retornar
}

// Resposta completa do endpoint de login (LoginResponseDto)
interface AuthResponse {
  token: string;
  user: UserInfo;
}

// Perfil completo do usuário (UserProfileDto)
interface UserProfile extends UserInfo {
  jobTitle: string;
  seniority: string;
  careerTrack: string;
  businessUnit: string;
  projects: string[];
  managerId?: string;
  managerName?: string;
  directReports?: string[];
  directReportsNames?: string[];
  mentorId?: string;
  mentorName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
