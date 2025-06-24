import type { FC } from 'react';
import { ROLES } from '../types/roles'; // Seu enum de papéis

import { FaCog, FaHome } from 'react-icons/fa';
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
    path: '/avaliacao',
    label: 'Avaliação de Ciclo',
    icon: LuFilePenLine,
    allowedRoles: [ROLES.COLLABORATOR],
  },
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
];
