import { useMemo, useState, useEffect } from 'react';
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
} from 'recharts';
import type { ClientEvaluation } from '../../../../services/ManagerService';

interface ChartProps {
  performanceHistory: PerformanceDataDto[];
  clientEvaluations: ClientEvaluation[];
}

const ClientProjectComparisonChart = ({ performanceHistory, clientEvaluations }: ChartProps) => {
  const chartData = useMemo(() => {
    if (!clientEvaluations) return [];

    return performanceHistory
      .map(item => {
        // Calcula a média da autoavaliação
        const selfScores = [item.selfScore.BEHAVIOR, item.selfScore.EXECUTION].filter(s => s !== null) as number[];
        const selfScoreAvg = selfScores.length > 0 ? selfScores.reduce((a, b) => a + b, 0) / selfScores.length : null;

        // Calcula a média da avaliação do gestor
        const managerScores = [item.managerScore.BEHAVIOR, item.managerScore.EXECUTION].filter(s => s !== null) as number[];
        const managerScoreAvg = managerScores.length > 0 ? managerScores.reduce((a, b) => a + b, 0) / managerScores.length : null;

        // Calcula a NOTA INTERNA (média entre gestor e autoavaliação)
        const internalScores = [selfScoreAvg, managerScoreAvg].filter(s => s !== null) as number[];
        const internalScore = internalScores.length > 0 ? internalScores.reduce((a, b) => a + b, 0) / internalScores.length : null;

        // Busca a NOTA DO CLIENTE da prop
        const clientEval = clientEvaluations.find(ce => ce.cycle === item.cycle);
        const clientScore = clientEval ? clientEval.score : null;

        return {
          cycle: item.cycle,
          internalScore: internalScore ? parseFloat(internalScore.toFixed(2)) : null,
          clientScore: clientScore,
        };
      })
      .filter(item => item.internalScore !== null || item.clientScore !== null) // Mostra o ciclo se tiver pelo menos uma das notas
      .reverse();
  }, [performanceHistory, clientEvaluations]);

  if (chartData.length === 0) {
    return <p className='text-center text-gray-500 mt-8'>Não há dados históricos de notas para este projeto.</p>;
  }

  return (
    <div className='mt-8' style={{ width: '100%', height: 400 }}>
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
          <Bar dataKey='internalScore' name='Nota Interna' fill='#24A19F' barSize={30}>
            <LabelList dataKey='internalScore' position='top' style={{ fill: '#042f2e', fontSize: 12 }} />
          </Bar>
          <Bar dataKey='clientScore' name='Nota do Cliente' fill='#F5B030' barSize={30}>
            <LabelList dataKey='clientScore' position='top' style={{ fill: '#6b460a', fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientProjectComparisonChart;
