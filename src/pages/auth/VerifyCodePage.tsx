import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Shield } from "lucide-react"

import AuthService from '../../services/AuthService'; 
import { useGlobalToast } from '../../hooks/useGlobalToast'; 

const VerifyCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: initialEmail } = location.state || {};

  const [email] = useState(initialEmail || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { success: showSuccessToast, error: showErrorToast } = useGlobalToast();

  // Redirecionar se o email não estiver presente (para evitar acesso direto)
  useEffect(() => {
    if (!initialEmail) {
      showErrorToast('Acesso Negado', 'Email ausente. Por favor, solicite um código de redefinição primeiro.');
      navigate('/forgot-password', { replace: true });
    }
  }, [initialEmail, navigate, showErrorToast]);

  // Iniciar timer para reenviar código
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Inicia o timer na montagem do componente se ainda não puder reenviar
  useEffect(() => {
    if (!canResend && resendTimer === 0) {
      setResendTimer(60); // Inicia com 60 segundos
    }
  }, [canResend, resendTimer]);


  const handleCodeChange = (index: number, value: string) => {
    // Permite apenas um dígito numérico
    if (!/^\d*$/.test(value) || value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      e.preventDefault(); // Evita que o Backspace apague o caractere do input anterior
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = ""; // Apaga o conteúdo do input anterior
      setCode(newCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      const msg = "Por favor, insira o código completo de 6 dígitos.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await AuthService.verifyResetCode({ email, code: fullCode }); 
      showSuccessToast('Sucesso!', 'Código verificado. Agora você pode redefinir sua senha.');
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email, code: fullCode } });
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao verificar código:', error);
      const msg = error.message || "Código inválido. Tente novamente.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return; // Não permite reenviar se o email não estiver preenchido

    setCanResend(false);
    setResendTimer(60); // Reinicia o timer para 60 segundos
    setErrorMessage(""); // Limpa erros anteriores

    try {
      await AuthService.forgotPassword({ email });
      showSuccessToast('Código Reenviado!', 'Um novo código foi enviado para o seu email.');
    } catch (error: any) {
      console.error("Erro ao reenviar código:", error);
      const msg = error.message || "Erro ao reenviar código. Tente novamente mais tarde.";
      setErrorMessage(msg);
      showErrorToast('Erro', msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-lg p-10 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]">
        {/* Cabeçalho do Card */}
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm transition-colors duration-200"
              onClick={() => navigate('/forgot-password')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
          </div>
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verificar Código</h2>
            <p className="text-gray-600 text-base">
              Insira o código de 6 dígitos enviado para
              <br />
              <strong>{email}</strong>
            </p>
          </div>
        </div>
        {/* Conteúdo do Card */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code-input" className="block text-sm font-medium text-gray-700 sr-only">Código de Verificação</label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500 text-gray-900 shadow-sm" // Classes de input
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-md border border-red-200 bg-red-50">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
            )}

            <button type="submit" className="w-full py-3 px-6 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-base" disabled={loading || code.join("").length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Código"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">Não recebeu o código?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || loading}
                className="text-green-600 hover:text-green-500 font-medium p-0 h-auto transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto mt-2"
              >
                {resendTimer > 0 && !canResend ? (
                  `Reenviar em ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar código
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyCodePage;