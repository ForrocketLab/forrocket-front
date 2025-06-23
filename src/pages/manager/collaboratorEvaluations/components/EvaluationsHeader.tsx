interface EvaluationHeaderProps {
  userName: string;
  userInitials: string;
  jobTitle: string;
  isSubmittable: boolean;
  onSubmit: () => void;
}

const EvaluationHeader = ({ userName, userInitials, jobTitle, isSubmittable, onSubmit }: EvaluationHeaderProps) => {
  return (
    <header className='bg-white p-6 shadow-sm'>
      <div className='flex justify-between items-center'>
        {/* Lado Esquerdo: Avatar e Informações do Usuário */}
        <div className='flex items-center gap-4'>
          <span className='bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center font-bold text-[#085F60] text-xl uppercase'>
            {userInitials}
          </span>
          <div className='flex flex-col'>
            <h1 className='text-xl font-bold text-gray-900'>{userName}</h1>
            <p className='text-sm font-normal text-gray-500'>{jobTitle}</p>
          </div>
        </div>

        {/* Lado Direito: Botão de Ação */}
        <div>
          <button
            onClick={onSubmit}
            disabled={!isSubmittable}
            className='px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 bg-[#08605F] hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Concluir e enviar
          </button>
        </div>
      </div>
    </header>
  );
};

export default EvaluationHeader;
