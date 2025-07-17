import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define a estrutura dos dados que o nosso gráfico espera
interface BurndownData {
  name: string;      // Nome do ponto no tempo (ex: "Dia 1", "Sprint 1")
  ideal: number;     // Quantidade ideal de trabalho restante
  real: number;      // Quantidade real de trabalho restante
}

interface ProductivityChartProps {
  data: BurndownData[];
}

const ProductivityChart: FC<ProductivityChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtividade da Equipe (Burndown)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            {/* Grade de fundo do gráfico */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* Eixo horizontal (tempo) */}
            <XAxis dataKey="name" />
            {/* Eixo vertical (tarefas restantes) */}
            <YAxis label={{ value: 'Tarefas', angle: -90, position: 'insideLeft', offset: 10 }} />
            {/* Tooltip que aparece ao passar o mouse sobre os pontos */}
            <Tooltip />
            {/* Legenda do gráfico */}
            <Legend />
            {/* Linha do progresso ideal */}
            <Line type="monotone" dataKey="ideal" name="Progresso Ideal" stroke="#8884d8" strokeDasharray="5 5" />
            {/* Linha do progresso real da equipe */}
            <Line type="monotone" dataKey="real" name="Progresso Real" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityChart;