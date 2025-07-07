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
import ManagerService, { type ClientScores } from '../../../../services/ManagerService';

interface ChartProps {
  performanceHistory: PerformanceDataDto[];
  selectedProjectId: string;
}

const ClientProjectComparisonChart = ({ performanceHistory, selectedProjectId }: ChartProps) => {
  const [clientScores, setClientScores] = useState<ClientScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchClientScores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const scores = await ManagerService.getClientProjectScores(selectedProjectId);
        setClientScores(scores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar notas do cliente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientScores();
  }, [selectedProjectId]);

  const chartData = useMemo(() => {
    if (!clientScores) return [];

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

        // Busca a NOTA DO CLIENTE dos dados recebidos da API
        const clientScore = clientScores[item.cycle] ?? null;

        return {
          cycle: item.cycle,
          internalScore: internalScore ? parseFloat(internalScore.toFixed(2)) : null,
          clientScore: clientScore,
        };
      })
      .filter(item => item.internalScore !== null || item.clientScore !== null) // Mostra o ciclo se tiver pelo menos uma das notas
      .reverse();
  }, [performanceHistory, clientScores]);

  if (isLoading) {
    return <p className='text-center text-gray-500 mt-8'>Carregando notas do cliente...</p>;
  }

  if (error) {
    return <p className='text-center text-red-500 mt-8'>Erro ao carregar dados do cliente: {error}</p>;
  }

  if (chartData.length === 0 && !isLoading) {
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
