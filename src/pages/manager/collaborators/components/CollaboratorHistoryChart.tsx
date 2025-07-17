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
  { value: 'assessments360Mean', label: 'Média do 360' },
  { value: 'selfScore', label: 'Média de Autoavaliação' },
  { value: 'managerScore', label: 'Média de Avaliação do Gestor' },
];

interface CollaboratorHistoryChart {
  performanceHistory: Array<{
    cycle: string;
    selfScore: {
      BEHAVIOR: number | null;
      EXECUTION: number | null;
      MANAGEMENT: number | null;
    };
    managerScore: {
      BEHAVIOR: number | null;
      EXECUTION: number | null;
      MANAGEMENT: number | null;
    };
    finalScore: number | null;
    assessments360Mean: number | null;
  }>;
}

const CollaboratorHistoryChart = ({ performanceHistory }: CollaboratorHistoryChart) => {
  const [selectedMetric, setSelectedMetric] = useState('finalScore');
  const selectedMetricLabel = metricOptions.find(opt => opt.value === selectedMetric)?.label;

  const chartData = useMemo(() => {
    return performanceHistory
      .map(item => {
        // Calcular média de autoavaliação (converter null para 0)
        const selfScores = [
          item.selfScore.BEHAVIOR ?? 0,
          item.selfScore.EXECUTION ?? 0,
          item.selfScore.MANAGEMENT ?? 0,
        ].filter(s => s > 0);
        const selfScoreAvg = selfScores.length > 0 ? selfScores.reduce((a, b) => a + b, 0) / selfScores.length : 0;

        // Calcular média de avaliação do gestor (converter null para 0)
        const managerScores = [
          item.managerScore.BEHAVIOR ?? 0,
          item.managerScore.EXECUTION ?? 0,
          item.managerScore.MANAGEMENT ?? 0,
        ].filter(s => s > 0);
        const managerScoreAvg =
          managerScores.length > 0 ? managerScores.reduce((a, b) => a + b, 0) / managerScores.length : 0;

        return {
          cycle: item.cycle,
          finalScore: parseFloat((item.finalScore ?? 0).toFixed(2)),
          assessments360Mean: parseFloat((item.assessments360Mean ?? 0).toFixed(2)),
          selfScore: parseFloat(selfScoreAvg.toFixed(2)),
          managerScore: parseFloat(managerScoreAvg.toFixed(2)),
        };
      })
      .reverse();
  }, [performanceHistory]);

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
              formatter={(value: number) => [value.toFixed(2), selectedMetricLabel]}
            />
            <Legend />

            <Bar dataKey={selectedMetric} name={selectedMetricLabel} barSize={40}>
              {/* Rótulo com o valor em cima de cada barra */}
              <LabelList
                dataKey={selectedMetric}
                position='top'
                style={{ fill: '#042f2e', fontSize: 12 }}
                formatter={(value: unknown) => (typeof value === 'number' ? value.toFixed(2) : String(value))}
              />

              {chartData.map((_, index) => (
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
