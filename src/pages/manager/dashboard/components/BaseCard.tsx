import { type ReactNode } from 'react';

interface BaseCardProps {
  title: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
  className?: string;
}

const BaseCard = ({ title, leftContent, rightContent, className = 'bg-white text-gray-800' }: BaseCardProps) => {
  return (
    <div className={`flex flex-col w-full p-6 rounded-2xl shadow-md ${className}`}>
      <h3 className='text-[16px] font-bold'>{title}</h3>

      {/*
        - mobile: 1 coluna, empilhando os itens.
        - Telas médias (md) ou maiores: 3 colunas.
      */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-2 flex-grow items-center'>
        {/* Ocupa 2 colunas em telas maiores */}
        <div className='md:col-span-2'>{leftContent}</div>

        {/* Ocupa 1 coluna em telas maiores */}
        <div className='flex items-center justify-start md:justify-center'>{rightContent}</div>
      </div>
    </div>
  );
};

export default BaseCard;
