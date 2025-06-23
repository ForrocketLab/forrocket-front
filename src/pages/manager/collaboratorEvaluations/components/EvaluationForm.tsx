import { type FC, type ReactNode } from 'react';

// A interface que definimos acima
interface EvaluationFormProps {
  title: string;
  selfScore: number | null;
  managerScore: number | null;
  completedCount: number;
  totalCount: number;
  children: ReactNode;
}

const EvaluationForm: FC<EvaluationFormProps> = ({
  title,
  selfScore,
  managerScore,
  completedCount,
  totalCount,
  children,
}) => {
  // Lógica para o chip de nota do gestor
  const managerScoreStyles = managerScore ? 'bg-[#08605F] text-white' : 'bg-[#E6E6E6] text-black';

  return (
    // Container principal do formulário com fundo branco e cantos arredondados
    <div className='w-full bg-white rounded-2xl shadow-sm p-6'>
      {/* Cabeçalho */}
      <header className='flex justify-between items-center pb-4 border-b border-gray-200'>
        {/* Lado Esquerdo: Título */}
        <h2 className='text-xl font-bold text-gray-800'>{title}</h2>

        {/* Lado Direito: Chips de Resumo */}
        <div className='flex items-center gap-3'>
          {/* Chip 1: Nota do Colaborador */}
          <div className='flex items-center justify-center w-12 h-8 bg-[#E6E6E6] text-[#08605F] font-bold text-sm rounded-md'>
            {selfScore ?? '-'}
          </div>

          {/* Chip 2: Nota do Gestor */}
          <div
            className={`flex items-center justify-center w-12 h-8 font-bold text-sm rounded-md ${managerScoreStyles}`}
          >
            {managerScore ?? '-'}
          </div>

          {/* Chip 3: Progresso de Preenchimento */}
          <div className='flex items-center justify-center h-8 px-4 bg-[#C8E7E7] text-[#08605F] font-bold text-xs rounded-md whitespace-nowrap'>
            {completedCount}/{totalCount} Preenchidos
          </div>
        </div>
      </header>

      {/* Corpo do Formulário */}
      <main className='mt-6'>
        {/* O conteúdo futuro (seus acordeões) será renderizado aqui */}
        {children}
      </main>
    </div>
  );
};

export default EvaluationForm;
