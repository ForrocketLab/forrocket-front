import { FC, ReactNode } from 'react';
import ProjectInfoCardBase from '../../../../components/cards/ProjectInfoCardBase';

interface ProjectInfoCardProps {
  title: string;
  description: string;
  value: string | number;
  icon: ReactNode;
}

const ProjectInfoCard: FC<ProjectInfoCardProps> = ({ title, description, value, icon }) => {
  const color = '#064b4c'; // Cor principal para o card

  return (
    <ProjectInfoCardBase
      title={title}
      leftContent={
        <div className='flex items-start'>
          <div className='w-1 self-stretch rounded-full mr-3' style={{ backgroundColor: color }}></div>
          <p className='text-sm text-gray-600 font-normal'>{description}</p>
        </div>
      }
      rightContent={
        <div className='flex items-center justify-end gap-3'>
          <div style={{ color }}>{icon}</div>
          <span className='text-3xl font-bold' style={{ color }}>
            {value}
          </span>
        </div>
      }
    />
  );
};

export default ProjectInfoCard;