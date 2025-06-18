import { Home, Users, BarChart, UserCheck, ShieldCheck, type LucideIcon } from 'lucide-react'; // Ícones de exemplo
import { ROLES } from '../types/roles'; // Seu enum de papéis

// Define a estrutura de um item de menu
export interface MenuItemConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  allowedRoles: string[];
}

// todas as opções de menu possíveis na aplicação
export const SIDE_MENU_CONFIG: MenuItemConfig[] = [
  {
    path: '/',
    label: 'Minha Home',
    icon: Home,
    allowedRoles: [ROLES.COLLABORATOR, ROLES.MANAGER, ROLES.RH, ROLES.ADMIN],
  },
  {
    path: '/manager',
    label: 'Painel do Gestor',
    icon: Users,
    allowedRoles: [ROLES.MANAGER, ROLES.ADMIN],
  },
  {
    path: '/rh',
    label: 'Painel de RH',
    icon: BarChart,
    allowedRoles: [ROLES.RH, ROLES.ADMIN],
  },
  {
    path: '/committee',
    label: 'Comitê',
    icon: UserCheck,
    allowedRoles: [ROLES.COMMITTEE, ROLES.ADMIN],
  },
  {
    path: '/admin',
    label: 'Administração',
    icon: ShieldCheck,
    allowedRoles: [ROLES.ADMIN],
  },
];
