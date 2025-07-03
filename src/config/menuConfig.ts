import type { FC } from 'react';
import { ROLES } from '../types/roles'; // Seu enum de papéis

import { FaCog } from 'react-icons/fa';
import { IoBarChartOutline } from 'react-icons/io5';
import { LuCaptions, LuFilePenLine, LuUsers } from 'react-icons/lu';
import { FileText, Users, Home, BarChart3, Settings, Shield, Building2, UsersRound } from 'lucide-react';
import SchoolIcon from '@mui/icons-material/School';

export interface IconProps {
  size?: number;
  className?: string;
}

// Define a estrutura de um item de menu
export interface MenuItemConfig {
  path: string;
  label: string;
  icon: FC<IconProps>;
  allowedRoles: string[];
}

// todas as opções de menu possíveis na aplicação
export const SIDE_MENU_CONFIG: MenuItemConfig[] = [
  // ===== COLABORADOR =====
  {
    path: '/',
    label: 'Minha Home',
    icon: Home,
    allowedRoles: [ROLES.COLLABORATOR],
  },
  {
    path: '/avaliacao',
    label: 'Avaliação de Ciclo',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.COLLABORATOR],
  },
  {
    path: '/okrs',
    label: 'Meus OKRs',
    icon: Target,
    allowedRoles: [ROLES.COLLABORATOR],
  },

  // ===== GESTOR =====
  {
    path: '/manager/dashboard',
    label: 'Dashboard Gestor',
    icon: BarChart3,
    allowedRoles: [ROLES.MANAGER],
  },
  {
    path: '/manager/collaborators',
    label: 'Meus Colaboradores',
    icon: Users,
    allowedRoles: [ROLES.MANAGER],
  },
  {
    path: '/manager/brutal-facts',
    label: 'Brutal Facts',
    icon: LuCaptions,
    allowedRoles: [ROLES.MANAGER],
  },

  // ===== RH =====
  {
    path: '/rh',
    label: 'Dashboard RH',
    icon: Building2,
    allowedRoles: [ROLES.RH],
  },
  {
    path: '/rh/colaboradores',
    label: 'Gestão de Colaboradores',
    icon: UsersRound,
    allowedRoles: [ROLES.RH],
  },
  {
    path: '/rh/criterios',
    label: 'Gestão de Critérios',
    icon: Settings,
    allowedRoles: [ROLES.RH],
  },

  // ===== COMITÊ =====
  {
    path: '/committee',
    label: 'Comitê de Avaliação',
    icon: Shield,
    allowedRoles: [ROLES.COMMITTEE],
  },
  {
    path: '/committee/equalizacoes',
    label: 'Equalizações',
    icon: BarChart3,
    allowedRoles: [ROLES.COMMITTEE],
  },

  // ===== ADMIN =====
  {
    path: '/admin',
    label: 'Painel Admin',
    icon: FaCog,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/admin/users',
    label: 'Gerenciar Usuários',
    icon: LuUsers,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/admin/cycles',
    label: 'Gerenciar Ciclos',
    icon: IoBarChartOutline,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/admin/phase-control',
    label: 'Controle de Fases',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/admin/reports',
    label: 'Relatórios Admin',
    icon: IoBarChartOutline,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/admin/auditlog',
    label: 'Audit Log',
    icon: FileText,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: '/pdis',
    label: 'Meus PDIs',
    icon: SchoolIcon,
    allowedRoles: [ROLES.COLLABORATOR, ROLES.MANAGER, ROLES.RH],
  },
];
