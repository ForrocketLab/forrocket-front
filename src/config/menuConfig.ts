import { ROLES } from '../types/roles'; // Seu enum de papéis

import { type IconType } from 'react-icons';

import { FaHome } from 'react-icons/fa';
import { IoBarChartOutline } from 'react-icons/io5';
import { LuFilePenLine, LuLayoutDashboard } from 'react-icons/lu';

// Define a estrutura de um item de menu
export interface MenuItemConfig {
  path: string;
  label: string;
  icon: IconType;
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
    allowedRoles: [ROLES.COLLABORATOR, ROLES.ADMIN],
  },
  {
    path: '/avaliacao',
    label: 'Avaliação de Ciclo',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.COLLABORATOR, ROLES.ADMIN],
  },
  {
    path: '/evolucao',
    label: 'Evolução',
    icon: IoBarChartOutline,
    allowedRoles: [ROLES.COLLABORATOR, ROLES.ADMIN],
  },
  {
    path: '/manager/dashboard',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    allowedRoles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    path: '/manager/colaborators',
    label: 'Colaboradores',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.MANAGER, ROLES.ADMIN],
  },
];
