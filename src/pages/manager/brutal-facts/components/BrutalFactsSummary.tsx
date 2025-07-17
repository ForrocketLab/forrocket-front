import { type FC } from 'react';
import SummaryBox from '../../collaborators/components/SummaryBox';

interface BrutalFactsSummaryProps {
  title: string;
  summaryText: string;
}

const BrutalFactsSummary: FC<BrutalFactsSummaryProps> = ({ title, summaryText }) => {
  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>{title}</h2>
      <SummaryBox title='Insights' summaryText={summaryText} />
    </div>
  );
};

export default BrutalFactsSummary;
