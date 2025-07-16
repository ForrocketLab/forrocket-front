import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginAgain = () => {
    // Fazer logout para limpar o token
    logout();
    // O logout já redireciona para /login, então não precisamos navegar manualmente
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          {/* Ícone de Acesso Negado */}
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 mb-6">
            Você não tem permissão para acessar esta página
          </p>

          {/* Mensagem Explicativa */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-red-800 mb-2">
                  Por que isso aconteceu?
                </h3>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Seu perfil não possui as permissões necessárias</li>
                  <li>• Você pode estar tentando acessar uma área restrita</li>
                  <li>• Sua sessão pode ter expirado</li>
                  <li>• O recurso pode estar disponível apenas para outros perfis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-800 mb-2">
                  O que você pode fazer?
                </h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Verificar se está logado com a conta correta</li>
                  <li>• Entrar em contato com o RH para solicitar acesso</li>
                  <li>• Voltar para a página inicial e navegar pelas áreas disponíveis</li>
                  <li>• Fazer logout e fazer login novamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-center">
            <button
              onClick={handleLoginAgain}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#085F60] text-white font-semibold rounded-lg hover:bg-[#064247] transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Fazer Login Novamente
            </button>
          </div>

          {/* Informação de Contato */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Se você acredita que isso é um erro, entre em contato com o suporte técnico ou com o RH.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            Sistema RPE - Rocket Performance Evaluation
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 