import { type FC } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  itemNameToDelete: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({ itemNameToDelete, onConfirm, onCancel, isLoading }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-0 text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Confirmar Exclusão
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Você tem certeza que deseja deletar a importação do arquivo
                <strong className="text-gray-700"> "{itemNameToDelete}"</strong>?
              </p>
              <p className="mt-2 text-sm text-red-500">
                Esta ação não pode ser desfeita. Todos os dados associados a esta importação serão permanentemente removidos.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deletando...' : 'Deletar'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;