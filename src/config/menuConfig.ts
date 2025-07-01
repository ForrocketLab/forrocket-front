import type { FC } from 'react';
import { ROLES } from '../types/roles'; // Seu enum de papéis

import { FaCog, FaHome, FaArrowAltCircleDown } from 'react-icons/fa';
import { IoBarChartOutline } from 'react-icons/io5';
import { LuFilePenLine, LuLayoutDashboard, LuLayoutTemplate, LuUsers } from 'react-icons/lu';
import { MdPeople } from 'react-icons/md';

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
  {
    path: '/',
    label: 'Minha Home',
    icon: FaHome,
    allowedRoles: [ROLES.COLLABORATOR, ROLES.MANAGER, ROLES.RH, ROLES.ADMIN],
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    allowedRoles: [ROLES.COLLABORATOR],
  },
  {
    path: '/avaliacao',
    label: 'Avaliação de Ciclo',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.COLLABORATOR],
  },
  {
    path: '/evolucao',
    label: 'Evolução',
    icon: IoBarChartOutline,
    allowedRoles: [ROLES.COLLABORATOR],
  },
  {
    path: '/manager/dashboard',
    label: 'Dashboard Gestor',
    icon: LuLayoutTemplate,
    allowedRoles: [ROLES.MANAGER],
  },
  {
    path: '/manager/collaborators',
    label: 'Colaboradores',
    icon: LuUsers,
    allowedRoles: [ROLES.MANAGER],
  },
  {
    path: '/committee',
    label: 'Painel do Comitê',
    icon: LuLayoutDashboard,
    allowedRoles: [ROLES.COMMITTEE, ROLES.ADMIN],
  },
  {
    path: '/committee/equalizacoes',
    label: 'Equalizações',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.COMMITTEE, ROLES.ADMIN],
  },
  {
    path: '/rh',
    label: 'Dashboard RH',
    icon: LuLayoutDashboard,
    allowedRoles: [ROLES.RH, ROLES.ADMIN],
  },
  {
    path: '/rh/colaboradores',
    label: 'Gestão de Colaboradores',
    icon: MdPeople,
    allowedRoles: [ROLES.RH, ROLES.ADMIN],
  },
  {
    path: '/rh/criterios',
    label: 'Critérios de Avaliação',
    icon: FaCog,
    allowedRoles: [ROLES.RH, ROLES.ADMIN],
  },
  {
    path:'/rh/importar-historicos',
    label: 'Importar Histórico',
    icon: FaArrowAltCircleDown,
    allowedRoles: [ROLES.RH, ROLES.ADMIN],
  }
];
