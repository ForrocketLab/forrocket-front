import React, { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

import AuthService from '../../services/AuthService'; 
import { useGlobalToast } from '../../hooks/useGlobalToast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successScreen, setSuccessScreen] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 
  
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await AuthService.forgotPassword({ email }); 

      setSuccessScreen(true);
      showSuccessToast('Email Enviado!', 'Verifique sua caixa de entrada para o código de redefinição.');

    } catch (error: any) {
      console.error('Erro ao enviar solicitação de redefinição de senha:', error);
      const msg = error.message || "Erro ao enviar solicitação de redefinição de senha.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleContinueToVerifyCode = () => {
    navigate('/verify-code', { state: { email } });
  };

  // Se a operação foi bem-sucedida, mostra a tela de confirmação
  if (successScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-center space-y-6">
          <div className="space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Enviado!</h2> 
            <p className="text-gray-600">
              Se o email estiver registrado, um código de redefinição foi enviado para <strong>{email}</strong>
            </p>
          </div>
          <div className="space-y-4"> 
            <button
              onClick={handleContinueToVerifyCode}
              className="w-full py-3 px-6 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            > 
              Continuar para Verificação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]"> 
        <div className="space-y-4 pb-6"> 
          <div className="flex items-center justify-between">
            <button
              type="button" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm transition-colors duration-200" 
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Esqueci a Senha</h2> 
            <p className="text-gray-600 text-base">Insira seu email para receber o código de redefinição</p> 
          </div>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label> 
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> 
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 text-base shadow-sm"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-md border border-red-200 bg-red-50">
                <p className="text-red-800 text-sm">{errorMessage}</p> 
              </div>
            )}

            <button type="submit" className="w-full py-3 px-6 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;