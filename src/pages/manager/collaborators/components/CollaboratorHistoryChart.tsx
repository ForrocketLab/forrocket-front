import { useMemo, useState } from 'react';
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

// Opções para o filtro
const metricOptions = [
  { value: 'finalScore', label: 'Nota Final' },
  { value: 'selfScore', label: 'Autoavaliação' },
  { value: 'managerScore', label: 'Avaliação do Gestor' },
];

interface CollaboratorHistoryChart {
  performanceHistory: PerformanceDataDto[];
}

const CollaboratorHistoryChart = ({ performanceHistory }: CollaboratorHistoryChart) => {
  const [selectedMetric, setSelectedMetric] = useState('finalScore');
  const selectedMetricLabel = metricOptions.find(opt => opt.value === selectedMetric)?.label;

  const chartData = useMemo(() => {
    return performanceHistory
      .map(item => {
        const selfScores = [item.selfScore.BEHAVIOR, item.selfScore.EXECUTION].filter(s => s !== null) as number[];
        const managerScores = [item.managerScore.BEHAVIOR, item.managerScore.EXECUTION].filter(
          s => s !== null,
        ) as number[];
        const selfScoreAvg = selfScores.length > 0 ? selfScores.reduce((a, b) => a + b, 0) / selfScores.length : null;
        const managerScoreAvg =
          managerScores.length > 0 ? managerScores.reduce((a, b) => a + b, 0) / managerScores.length : null;

        return {
          cycle: item.cycle,
          finalScore: item.finalScore,
          selfScore: selfScoreAvg,
          managerScore: managerScoreAvg,
        };
      })
      .filter(item => item[selectedMetric as keyof typeof item] !== null)
      .reverse();
  }, [performanceHistory, selectedMetric]);

  const BAR_COLORS = ['#F5C130', '#24A19F', '#F5B030', '#419958'];

  return (
    <div className='bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full mb-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-2 sm:mb-0'>Desempenho</h2>
        <div className='flex items-center gap-2'>
          <label htmlFor='metric-filter' className='text-sm font-medium text-gray-700'>
            Métrica:
          </label>
          <select
            id='metric-filter'
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
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

      <div style={{ width: '100%', height: 400 }}>
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
              {/* Rótulo com o valor em cima de cada barra */}
              <LabelList dataKey={selectedMetric} position='top' style={{ fill: '#042f2e', fontSize: 12 }} />

              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CollaboratorHistoryChart;
