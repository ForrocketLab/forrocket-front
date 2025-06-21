import { type FC } from 'react';
import { useGlobalToast } from '../hooks/useGlobalToast';

const ToastTest: FC = () => {
  const toast = useGlobalToast();

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-bold">Teste de Notificações</h3>
      <div className="flex gap-2">
        <button
          onClick={() => toast.success('Sucesso!', 'Esta é uma notificação de sucesso')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sucesso
        </button>
        <button
          onClick={() => toast.error('Erro!', 'Esta é uma notificação de erro')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Erro
        </button>
        <button
          onClick={() => toast.warning('Aviso!', 'Esta é uma notificação de aviso')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Aviso
        </button>
        <button
          onClick={() => toast.info('Info!', 'Esta é uma notificação informativa')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Info
        </button>
      </div>
    </div>
  );
};

export default ToastTest; 