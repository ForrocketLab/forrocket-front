import React from 'react';
import { FileText, Database, Clock, User } from 'lucide-react';

const AuditLogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Audit Log
          </h1>
        </div>
        <p className="text-gray-600">
          Registros de auditoria e logs do sistema - Monitoramento de atividades e requisições
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Logs</h3>
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">0</div>
          <p className="text-sm text-gray-500">Registros no sistema</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Logs Hoje</h3>
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">0</div>
          <p className="text-sm text-gray-500">Nas últimas 24h</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Usuários Ativos</h3>
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">0</div>
          <p className="text-sm text-gray-500">Com atividade recente</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Requisições</h3>
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">0</div>
          <p className="text-sm text-gray-500">API calls registradas</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Logs de Auditoria</h2>
          <p className="text-sm text-gray-600 mt-1">
            Visualização e análise dos logs do sistema
          </p>
        </div>
        
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Funcionalidade em Desenvolvimento
            </h3>
            <p className="text-gray-600 mb-4">
              O sistema de audit log está sendo desenvolvido. Em breve você poderá visualizar:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Logs de requisições HTTP
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Atividades dos usuários
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Alterações no sistema
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Eventos de autenticação
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Próximas funcionalidades:</strong> Filtros avançados, exportação de logs, 
                alertas automáticos e dashboard de monitoramento em tempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage; 