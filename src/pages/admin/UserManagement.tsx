import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import AdminService, { 
  type UserData, 
  type CreateUserData,
  type ProjectData,
  type UserSummary,
  type HierarchyValidationResult
} from '../../services/AdminService';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye,
  Edit,
  Trash2,
  Shield,
  User,
  Crown,
  Building2,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertTriangle,
  Briefcase,
  UserPlus
} from 'lucide-react';

interface UserFilters {
  search: string;
  businessUnit: string;
  seniority: string;
  careerTrack: string;
  roles: string;
  isActive: boolean | null;
}

interface ProjectAssignment {
  projectId: string;
  projectName: string;
  roleInProject: 'colaborador' | 'gestor';
  validationResult?: HierarchyValidationResult;
  suggestedManagerId?: string;
  suggestedManagerName?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    businessUnit: '',
    seniority: '',
    careerTrack: '',
    roles: '',
    isActive: null
  });
  
  // Estados para modal de criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Dados para o modal
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [potentialMentors, setPotentialMentors] = useState<UserSummary[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    userType: 'project_member',
    name: '',
    email: '',
    password: '',
    jobTitle: 'Desenvolvedora Frontend',
    seniority: 'Júnior',
    careerTrack: 'Tech',
    businessUnit: 'Digital Products',
    projectAssignments: [],
    mentorId: undefined
  });

  // Estados para controle de projetos e hierarquia
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<UserSummary | null>(null);
  const [hierarchyValidations, setHierarchyValidations] = useState<Map<string, HierarchyValidationResult>>(new Map());

  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  // Carregar dados do modal quando abrir
  useEffect(() => {
    if (showCreateModal) {
      loadModalData();
    }
  }, [showCreateModal]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllUsers();
      console.log('✅ Usuários carregados:', data.length);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showErrorToast('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadModalData = async () => {
    try {
      setLoadingModalData(true);
      const [projectsData, mentorsData] = await Promise.all([
        AdminService.getAllProjects(),
        AdminService.getPotentialMentors()
      ]);
      setProjects(projectsData.filter(p => p.isActive));
      setPotentialMentors(mentorsData);
    } catch (error) {
      console.error('Erro ao carregar dados do modal:', error);
    } finally {
      setLoadingModalData(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.jobTitle.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por unidade de negócio
    if (filters.businessUnit) {
      filtered = filtered.filter(user => user.businessUnit === filters.businessUnit);
    }

    // Filtro por senioridade
    if (filters.seniority) {
      filtered = filtered.filter(user => user.seniority === filters.seniority);
    }

    // Filtro por trilha de carreira
    if (filters.careerTrack) {
      filtered = filtered.filter(user => user.careerTrack === filters.careerTrack);
    }

    // Filtro por role
    if (filters.roles) {
      filtered = filtered.filter(user => user.roles.includes(filters.roles));
    }

    // Filtro por status ativo
    if (filters.isActive !== null) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      
      // Preparar dados do usuário
      const userData: CreateUserData = {
        ...createFormData,
        projectAssignments: projectAssignments.map(pa => ({
          projectId: pa.projectId,
          roleInProject: pa.roleInProject
        })),
        mentorId: selectedMentor?.id
      };

      const newUser = await AdminService.createUser(userData);
      console.log('✅ Usuário criado:', newUser);
      
      // Atualizar lista de usuários
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setCreateFormData({
        userType: 'project_member',
        name: '',
        email: '',
        password: '',
        jobTitle: 'Desenvolvedora Frontend',
        seniority: 'Júnior',
        careerTrack: 'Tech',
        businessUnit: 'Digital Products',
        projectAssignments: [],
        mentorId: undefined
      });
      setProjectAssignments([]);
      setSelectedMentor(null);
      setHierarchyValidations(new Map());
      setShowCreateModal(false);
      showSuccessToast('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao criar usuário');
    } finally {
      setCreateLoading(false);
    }
  };

  // Adicionar projeto ao usuário
  const addProjectAssignment = () => {
    const newAssignment: ProjectAssignment = {
      projectId: '',
      projectName: '',
      roleInProject: 'colaborador',
    };
    setProjectAssignments(prev => [...prev, newAssignment]);
  };

  // Remover projeto
  const removeProjectAssignment = (index: number) => {
    setProjectAssignments(prev => prev.filter((_, i) => i !== index));
  };

  // Atualizar projeto
  const updateProjectAssignment = async (index: number, field: keyof ProjectAssignment, value: any) => {
    const updatedAssignments = [...projectAssignments];
    updatedAssignments[index] = { ...updatedAssignments[index], [field]: value };

    if (field === 'projectId') {
      const project = projects.find(p => p.id === value);
      if (project) {
        updatedAssignments[index].projectName = project.name;
        
        // Validar hierarquia se for papel de gestor
        if (updatedAssignments[index].roleInProject === 'gestor') {
          try {
            const validation = await AdminService.validateProjectHierarchy(value, 'gestor');
            updatedAssignments[index].validationResult = validation;
            setHierarchyValidations(prev => new Map(prev.set(`${value}-gestor`, validation)));
          } catch (error) {
            console.error('Erro ao validar hierarquia:', error);
          }
        }
      }
    }

    if (field === 'roleInProject' && value === 'gestor') {
      // Validar se pode ser gestor deste projeto
      try {
        const validation = await AdminService.validateProjectHierarchy(updatedAssignments[index].projectId, 'gestor');
        updatedAssignments[index].validationResult = validation;
        setHierarchyValidations(prev => new Map(prev.set(`${updatedAssignments[index].projectId}-gestor`, validation)));
      } catch (error) {
        console.error('Erro ao validar hierarquia:', error);
      }
    }

    setProjectAssignments(updatedAssignments);
  };

  const getUniqueValues = (field: keyof UserData) => {
    return [...new Set(users.map(u => u[field]))].filter(Boolean).sort() as string[];
  };

  const getAllRoles = () => {
    const allRoles = new Set<string>();
    users.forEach(user => {
      user.roles.forEach(role => allRoles.add(role));
    });
    return Array.from(allRoles).sort();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'rh': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'comite': return <Shield className="h-4 w-4 text-green-600" />;
      case 'gestor': return <Users className="h-4 w-4 text-orange-600" />;
      case 'colaborador': return <User className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Admin',
      'rh': 'RH',
      'comite': 'Comitê',
      'gestor': 'Gestor',
      'colaborador': 'Colaborador'
    };
    return roleMap[role] || role;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      businessUnit: '',
      seniority: '',
      careerTrack: '',
      roles: '',
      isActive: null
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-7 w-7 text-teal-600" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os usuários do sistema - {users.length} usuários cadastrados
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Usuário
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Nome, email ou cargo..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Unidade de Negócio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Negócio
            </label>
            <select
              value={filters.businessUnit}
              onChange={(e) => setFilters(prev => ({ ...prev, businessUnit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {getUniqueValues('businessUnit').map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          {/* Senioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senioridade
            </label>
            <select
              value={filters.seniority}
              onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {getUniqueValues('seniority').map(seniority => (
                <option key={seniority} value={seniority}>{seniority}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.roles}
              onChange={(e) => setFilters(prev => ({ ...prev, roles: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {getAllRoles().map(role => (
                <option key={role} value={role}>{getRoleLabel(role)}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.isActive === null ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                isActive: e.target.value === '' ? null : e.target.value === 'true' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-teal-800">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {getRoleIcon(role)}
                          {getRoleLabel(role)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.jobTitle}</div>
                    <div className="text-sm text-gray-500">{user.seniority} • {user.careerTrack}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.businessUnit}</div>
                    {user.managerName && (
                      <div className="text-sm text-gray-500">
                        Gestor: {user.managerName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-teal-600 hover:text-teal-900 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ajuste os filtros ou crie um novo usuário.
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal - EXPANDIDO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Criar Novo Usuário</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {loadingModalData ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-6">
                {/* Dados Básicos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-teal-600" />
                    Dados Básicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de Usuário */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Usuário *
                      </label>
                      <select
                        value={createFormData.userType}
                        onChange={(e) => setCreateFormData(prev => ({ 
                          ...prev, 
                          userType: e.target.value as CreateUserData['userType']
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="project_member">Membro de Projeto</option>
                        <option value="rh">RH</option>
                        <option value="comite">Comitê</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="usuario@rocketcorp.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Senha */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha *
                      </label>
                      <input
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        minLength={8}
                        required
                      />
                    </div>

                    {/* Cargo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo *
                      </label>
                      <select
                        value={createFormData.jobTitle}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="Desenvolvedora Frontend">Desenvolvedora Frontend</option>
                        <option value="Desenvolvedor Backend">Desenvolvedor Backend</option>
                        <option value="Product Designer">Product Designer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Tech Lead">Tech Lead</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="People & Culture Manager">People & Culture Manager</option>
                        <option value="Head of Engineering">Head of Engineering</option>
                        <option value="System Administrator">System Administrator</option>
                      </select>
                    </div>

                    {/* Senioridade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senioridade *
                      </label>
                      <select
                        value={createFormData.seniority}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, seniority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="Júnior">Júnior</option>
                        <option value="Pleno">Pleno</option>
                        <option value="Sênior">Sênior</option>
                        <option value="Principal">Principal</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>

                    {/* Trilha de Carreira */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trilha de Carreira *
                      </label>
                      <select
                        value={createFormData.careerTrack}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, careerTrack: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="Tech">Tech</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>

                    {/* Unidade de Negócio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade de Negócio *
                      </label>
                      <select
                        value={createFormData.businessUnit}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, businessUnit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="Digital Products">Digital Products</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Alocação em Projetos - Só para project_member */}
                {createFormData.userType === 'project_member' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Alocação em Projetos
                      </h3>
                      <button
                        type="button"
                        onClick={addProjectAssignment}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Projeto
                      </button>
                    </div>

                    {projectAssignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <p>Nenhum projeto adicionado</p>
                        <p className="text-sm">Use o botão acima para adicionar projetos</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projectAssignments.map((assignment, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Projeto */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Projeto *
                                </label>
                                <select
                                  value={assignment.projectId}
                                  onChange={(e) => updateProjectAssignment(index, 'projectId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                >
                                  <option value="">Selecione um projeto</option>
                                  {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Role no Projeto */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Papel no Projeto *
                                </label>
                                <select
                                  value={assignment.roleInProject}
                                  onChange={(e) => updateProjectAssignment(index, 'roleInProject', e.target.value as 'colaborador' | 'gestor')}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                >
                                  <option value="colaborador">Colaborador</option>
                                  <option value="gestor">Gestor</option>
                                </select>
                              </div>

                              {/* Ações */}
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => removeProjectAssignment(index)}
                                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Remover
                                </button>
                              </div>
                            </div>

                            {/* Validação de Hierarquia */}
                            {assignment.validationResult && (
                              <div className="mt-3">
                                {!assignment.validationResult.valid && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-red-800 mb-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="font-medium">Atenção!</span>
                                    </div>
                                    {assignment.validationResult.errors.map((error, i) => (
                                      <p key={i} className="text-red-700 text-sm">{error}</p>
                                    ))}
                                  </div>
                                )}

                                {assignment.validationResult.warnings.length > 0 && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="font-medium">Avisos:</span>
                                    </div>
                                    {assignment.validationResult.warnings.map((warning, i) => (
                                      <p key={i} className="text-yellow-700 text-sm">{warning}</p>
                                    ))}
                                  </div>
                                )}

                                {assignment.validationResult.suggestedManagerId && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                                    <div className="flex items-center gap-2 text-green-800 mb-2">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="font-medium">Gestor Automático:</span>
                                    </div>
                                    <p className="text-green-700 text-sm">
                                      Será automaticamente subordinado ao gestor: {assignment.validationResult.suggestedManagerName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mentoria - Só para project_member */}
                {createFormData.userType === 'project_member' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                      Mentoria (Opcional)
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mentor Designado
                      </label>
                      <select
                        value={selectedMentor?.id || ''}
                        onChange={(e) => {
                          const mentor = potentialMentors.find(m => m.id === e.target.value);
                          setSelectedMentor(mentor || null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Sem mentor designado</option>
                        {potentialMentors.map(mentor => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name} - {mentor.jobTitle}
                          </option>
                        ))}
                      </select>
                      {selectedMentor && (
                        <div className="mt-2 p-2 bg-purple-100 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Mentor Selecionado:</strong> {selectedMentor.name} ({selectedMentor.jobTitle})
                          </p>
                          <p className="text-xs text-purple-600">
                            Email: {selectedMentor.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {createLoading ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 