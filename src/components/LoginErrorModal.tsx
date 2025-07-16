import { FC } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LoginErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export const LoginErrorModal: FC<LoginErrorModalProps> = ({ isOpen, onClose, errorMessage }) => {

  if (!isOpen) return null;

  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300'>
      <div className='bg-white rounded-lg p-4 max-w-md w-full mx-4 shadow-xl border border-red-200'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center'>
            <AlertTriangle className='h-5 w-5 text-red-500 mr-2' />
            <h3 className='text-base font-semibold text-gray-900'>Erro no Login</h3>
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='h-4 w-4' />
          </button>
        </div>

        <p className='text-gray-600 mb-4 text-sm'>{errorMessage}</p>

        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};