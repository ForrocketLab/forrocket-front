import { type FC, type ReactNode } from 'react';

interface BaseCardProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  className?: string;
}

const BaseCard: FC<BaseCardProps> = ({
  leftColumn,
  rightColumn,
  className = 'bg-white', // Fundo padrão
}) => {
  return (
    // Container principal: define o grid e o estilo do card
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl shadow-md ${className}`}>
      {/* Slot para a Coluna Esquerda (ocupa 2/3 da largura em telas maiores) */}
      <div className='md:col-span-2'>{leftColumn}</div>

      {/* Slot para a Coluna Direita (ocupa 1/3 da largura em telas maiores) */}
      <div className='flex items-center justify-center md:justify-end'>{rightColumn}</div>
    </div>
  );
};

export default BaseCard;
