import { type FC } from 'react';
import { Link } from 'react-router-dom';
import CollaboratorRow, { type CollaboratorRowProps } from './CollaboratorRow';

interface CollaboratorsTableProps {
  collaborators: DashboardSubordinate[];
}

const CollaboratorsTable: FC<CollaboratorsTableProps> = ({ collaborators }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md'>
      {/* Cabeçalho com título e link "Ver mais" */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800'>Colaboradores</h2>
        <Link to='#' className='text-sm text-teal-600 font-semibold hover:underline'>
          Ver mais
        </Link>
      </div>

      {/* Lista de colaboradores */}
      <div className='flex flex-col'>
        {collaborators.map(collaborator => (
          <CollaboratorRow
            key={collaborator.id} // ID único
            {...collaborator}
          />
        ))}
      </div>
    </div>
  );
};

export default CollaboratorsTable;
