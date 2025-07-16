// Credenciais necessárias para o login (LoginDto)
export interface LoginCredentials {
  email: string;
  password: string;
}

// Informações básicas do usuário retornadas no login (UserInfoDto)
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  roles: string[];
}
// Resposta completa do endpoint de login (LoginResponseDto)
export interface AuthResponse {
  token: string;
  user: UserInfo;
}

// Perfil completo do usuário (UserProfileDto)
export interface UserProfile extends UserInfo {
  jobTitle: string;
  seniority: string;
  careerTrack: string;
  businessUnit: string;
  projectRoles: ProjectRole[];
  managerId?: string | null; 
  managerName?: string | null; 
  directReports?: string[] | null; 
  directReportsNames?: string[] | null; 
  mentorId?: string | null; 
  mentorName?: string | null; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRole {
  projectId: string;
  projectName: string;
  roles: string[];
}

// Interfaces para os DTOs de redefinição de senha (se ainda não estiverem definidas)
export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
