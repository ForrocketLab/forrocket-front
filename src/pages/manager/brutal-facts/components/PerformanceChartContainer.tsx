import { type FC, useMemo } from 'react';
import SummaryBox from '../../collaborators/components/SummaryBox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';

interface PerformanceData {
  cycle: string;
  finalScore: number | null;
  selfScore: number;
  managerScore: number;
}

interface MetricOption {
  value: string;
  label: string;
}

interface PerformanceChartContainerProps {
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  performanceData: PerformanceData[];
  metricOptions: MetricOption[];
  insightText: string;
}

const PerformanceChartContainer: FC<PerformanceChartContainerProps> = ({
  selectedMetric,
  onMetricChange,
  performanceData,
  metricOptions,
  insightText,
}) => {
  const selectedMetricLabel = metricOptions.find(opt => opt.value === selectedMetric)?.label;

  const chartData = useMemo(() => {
    return performanceData.filter(item => item[selectedMetric as keyof PerformanceData] !== null);
  }, [selectedMetric, performanceData]);

  const BAR_COLORS = ['#F5C130', '#24A19F', '#F5B030', '#419958'];

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-2 sm:mb-0'>Desempenho</h2>
        <div className='flex items-center gap-2'>
          <label htmlFor='metric-filter' className='text-sm font-medium text-gray-700'>
            Métrica:
          </label>
          <select
            id='metric-filter'
            value={selectedMetric}
            onChange={e => onMetricChange(e.target.value)}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 p-2'
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ width: '100%', height: 400 }} className='mb-6'>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis dataKey='cycle' tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis domain={[0, 5]} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(209, 213, 219, 0.3)' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />

            <Bar dataKey={selectedMetric} name={selectedMetricLabel} barSize={40}>
              <LabelList dataKey={selectedMetric} position='top' style={{ fill: '#042f2e', fontSize: 12 }} />
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Box para Insights */}
      <div className='border-t border-gray-200 pt-6'>
        <SummaryBox title='Insights' summaryText={insightText} />
      </div>
    </div>
  );
};

export default PerformanceChartContainer;
