import { useState, type FC, type ComponentType } from 'react';
import {
  useForm,
  type SubmitHandler,
  type UseFormRegister,
  type FieldError,
  type RegisterOptions,
} from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { Mail, Lock } from 'lucide-react';
import { ROLES } from '../../types/roles';
import { useAuth } from '../../hooks/useAuth';

type LoginFormInputs = {
  email: string;
  password: string;
};

interface FormInputProps {
  id: keyof LoginFormInputs;
  type: 'email' | 'password';
  placeholder: string;
  register: UseFormRegister<LoginFormInputs>;
  error?: FieldError;
  icon: ComponentType<{ className: string }>;
  validation?: RegisterOptions<LoginFormInputs>;
}

interface FormButtonProps {
  text: string;
  loading: boolean;
}

const LoginPage: FC = () => {
  const { login } = useAuth(); // Pegue a função login do contexto!
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'ana.oliveira@rocketcorp.com',
      password: 'password123',
    },
  });

  const onLogin: SubmitHandler<LoginFormInputs> = async data => {
    setLoading(true);
    setApiError('');
    try {
      await login(data);
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const FormInput: FC<FormInputProps> = ({ id, type, placeholder, register, error, icon: Icon, validation }) => (
    <div className='relative mb-4'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        <Icon className='h-5 w-5 text-gray-400' />
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, validation)}
        className={`w-full rounded-full border bg-gray-50 py-3 pl-12 pr-4 text-gray-800 transition-all duration-300 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${error ? 'border-red-500 ring-red-500' : 'border-gray-200'}`}
      />
      {error && <p className='mt-1 pl-3 text-xs text-red-600'>{error.message}</p>}
    </div>
  );

  const FormButton: FC<FormButtonProps> = ({ text, loading }) => (
    <button
      type='submit'
      disabled={loading}
      className='w-full rounded-full bg-gradient-to-r from-green-500 to-teal-600 py-3 font-bold text-white uppercase tracking-wider shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 hover:cursor-pointer'
    >
      {loading ? 'Processando...' : text}
    </button>
  );

  return (
    <main className='flex min-h-screen bg-white'>
      {/*Onboard*/}
      <div className='relative hidden w-1/2 flex-col items-center justify-center text-white md:flex'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className='absolute inset-0 bg-green-800 opacity-60' />
        <div className='relative z-10 flex flex-col items-center text-center p-10'>
          <h1 className='mb-4 text-6xl font-extrabold tracking-tight drop-shadow-lg'>Bem-vindo!</h1>
          <p className='mb-8 max-w-md text-lg leading-relaxed'>
            O Sistema RPE oferece plataforma completa para gestão de desempenho, facilitando avaliações e impulsionando
            o crescimento profissional.
          </p>
          <Link
            to='/signup'
            className='rounded-full border-2 border-white px-10 py-3 font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-green-800'
          >
            Cadastre-se
          </Link>
        </div>
      </div>

      {/*Formulário*/}
      <div className='flex w-full items-center justify-center p-8 md:w-1/2'>
        <div className='w-full max-w-md space-y-8'>
          <div>
            <h2 className='text-center text-4xl font-bold text-gray-900'>Faça seu Login</h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Não tem uma conta?
              <Link to='/signup' className='font-medium text-green-600 hover:text-green-500 ml-1'>
                Comece por aqui
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onLogin)} className='mt-8 space-y-6'>
            <div className='space-y-4 rounded-md'>
              <FormInput
                id='email'
                type='email'
                placeholder='Email'
                register={register}
                error={errors.email}
                icon={Mail}
                validation={{
                  required: 'O email é obrigatório.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Por favor, insira um email válido.',
                  },
                }}
              />
              <FormInput
                id='password'
                type='password'
                placeholder='Senha'
                register={register}
                error={errors.password}
                icon={Lock}
                validation={{
                  required: 'A senha é obrigatória.',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter pelo menos 6 caracteres.',
                  },
                }}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='text-sm'>
                <a href='#' className='font-medium text-green-600 hover:text-green-500'>
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

            {apiError && <p className='text-center text-sm text-red-600'>{apiError}</p>}

            <FormButton text='Login' loading={loading} />
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
