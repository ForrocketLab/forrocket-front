import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, X, Mail, Key } from "lucide-react" 
import AuthService from '../../services/AuthService'; 
import { useGlobalToast } from '../../hooks/useGlobalToast'; 

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: initialEmail, code: initialCode } = location.state || {};

  // Usar os valores do state ou strings vazias como fallback
  const [email] = useState(initialEmail || "");
  const [code] = useState(initialCode || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  useEffect(() => {
    if (!initialEmail || !initialCode) {
      showErrorToast('Acesso Negado', 'Email ou código de verificação ausentes. Por favor, reinicie o processo de redefinição de senha.');
      navigate('/forgot-password', { replace: true });
    }
  }, [initialEmail, initialCode, navigate, showErrorToast]);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    Object.values(checks).forEach((check) => check && score++)
    return { score, checks }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const strengthPercentage = (passwordStrength.score / 5) * 100
  const strengthColor =
    strengthPercentage < 40 ? "bg-red-500" : strengthPercentage < 80 ? "bg-yellow-500" : "bg-green-500"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); 

    if (newPassword !== confirmPassword) {
      const msg = "As senhas não coincidem.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
      return;
    }

    if (passwordStrength.score < 3) {
      const msg = "A senha deve atender pelo menos 3 critérios de segurança.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
      return;
    }

    setLoading(true);

    try {
      await AuthService.resetPassword({ email, code, newPassword }); 
      
      showSuccessToast('Sucesso!', 'Sua senha foi redefinida. Faça login com a nova senha.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000); 

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      const msg = error.message || "Erro ao redefinir a senha.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-lg p-10 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]"> {/* Equivalente ao Card */}
        <div className="space-y-4 pb-6"> 
          <div className="flex items-center justify-between">
            <button
              type="button" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm transition-colors duration-200" 
              onClick={() => navigate('/verify-code', { state: { email } })} 
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Redefinir Senha</h2> 
            <p className="text-gray-600 text-base">Crie uma nova senha segura para sua conta</p> 
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
                  placeholder="Seu email"
                  value={email}
                  readOnly
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-200 bg-gray-100 cursor-not-allowed focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 text-base shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código de Verificação</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="code"
                  type="text"
                  placeholder="Código de verificação"
                  value={code}
                  readOnly
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-200 bg-gray-100 cursor-not-allowed focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 text-base shadow-sm"
                  required
                />
              </div>
            </div>


            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 bg-gray-50 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 placeholder-gray-500 text-base shadow-sm" // Ajuste de classes
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Força da senha:</span>
                    <span className={`font-medium ${strengthPercentage < 40 ? "text-red-500" : strengthPercentage < 80 ? "text-yellow-500" : "text-green-500"}`}>
                      {strengthPercentage < 40 ? "Fraca" : strengthPercentage < 80 ? "Média" : "Forte"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>
                  {/* Lista de requisitos da senha */}
                  <ul className="text-xs text-gray-500 space-y-1 mt-2">
                      <li className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.length ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          8+ caracteres
                      </li>
                      <li className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Maiúscula
                      </li>
                      <li className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.lowercase ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Minúscula
                      </li>
                      <li className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.number ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Número
                      </li>
                      <li className={`flex items-center gap-1 ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.special ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Caractere especial
                      </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Senha</label> 
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 bg-gray-50 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-900 placeholder-gray-500 text-base shadow-sm" // Ajuste de classes
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 flex items-center justify-center" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600 px-1">As senhas não coincidem.</p>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 rounded-md border border-red-200 bg-red-50">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-base"
              disabled={loading || newPassword !== confirmPassword || passwordStrength.score < 3}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage;