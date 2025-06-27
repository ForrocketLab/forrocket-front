import { type ReactNode } from 'react';
import { Sparkles } from 'lucide-react'; // Um ícone de "insights" ou "brilho", similar ao da imagem

// Props para o nosso novo componente
interface SummaryBoxProps {
  title: string;
  summaryText: string;
  // Permite passar um ícone customizado, mas já definimos um padrão
  icon?: ReactNode;
}

const SummaryBox = ({
  title,
  summaryText,
  icon = <Sparkles className='w-5 h-5 text-teal-600 flex-shrink-0' />, // Ícone padrão
}: SummaryBoxProps) => {
  return (
    // Container principal: fundo cinza claro, padding, cantos arredondados,
    // e a borda esquerda colorida que cria o efeito da "barra"
    <div className='bg-slate-50 p-4 rounded-lg border-l-4 border-teal-600'>
      {/* Cabeçalho: Ícone + Título */}
      <div className='flex items-center gap-2'>
        {icon}
        <h4 className='font-bold text-gray-800'>{title}</h4>
      </div>

      {/* Corpo: Texto do Resumo */}
      <p className='mt-2 text-sm text-gray-600 pl-7'>
        {/* Adiciona um padding à esquerda para alinhar com o título */}
        {summaryText}
      </p>
    </div>
  );
};

export default SummaryBox;
