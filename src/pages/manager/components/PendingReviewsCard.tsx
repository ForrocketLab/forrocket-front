import BaseCard from './BaseCard'; // Importe o componente base
import { FaUsers } from 'react-icons/fa';

interface PendingReviewsCardProps {
  title: string;
  description: string;
  pendingCount: number;
}

const PendingReviewsCard = (props: PendingReviewsCardProps) => {
  return (
    <BaseCard
      // Passa as classes de estilo para o BaseCard sobrescrever o padrão
      className='bg-[#08605F] text-white'
      // Conteúdo da Coluna Esquerda: Título + Descrição com barra
      leftColumn={
        <div className='flex flex-col gap-2 h-full'>
          <h3 className='text-[16px] font-bold'>{props.title}</h3>
          <div className='flex items-start mt-2'>
            <div className='w-1 self-stretch rounded-full mr-3 bg-white/50'></div>
            <p className='text-[10px] font-normal text-white/80'>{props.description}</p>
          </div>
        </div>
      }
      // Conteúdo da Coluna Direita: Ícone + Contagem
      rightColumn={
        <div className='flex items-center justify-end gap-3'>
          <FaUsers size={32} />
          <span className='text-4xl font-bold'>{props.pendingCount}</span>
        </div>
      }
    />
  );
};

export default PendingReviewsCard;
