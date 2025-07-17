import React from 'react';
import { BookOpen, Target, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import type { PDISummary } from '../../../types/pdis';
import { isPDIOverdue } from '../../../types/pdis';

interface PDIStatsProps {
  pdis: PDISummary[];
}

const PDIStats: React.FC<PDIStatsProps> = ({ pdis }) => {
  const total = pdis.length;
  const active = pdis.filter(pdi => pdi.status === 'IN_PROGRESS').length;
  const completed = pdis.filter(pdi => pdi.status === 'COMPLETED').length;
  const overdue = pdis.filter(pdi => isPDIOverdue(pdi)).length;
  const averageProgress = total > 0 
    ? Math.round(pdis.reduce((sum, pdi) => sum + pdi.progressPercentage, 0) / total)
    : 0;

  const stats = [
    {
      title: 'Total de PDIs',
      value: total,
      icon: BookOpen,
      color: 'text-[#085F60]',
      bgColor: 'bg-[#085F60]/10',
    },
    {
      title: 'PDIs Ativos',
      value: active,
      icon: Target,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      title: 'PDIs Concluídos',
      value: completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Progresso Médio',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  // Se há PDIs em atraso, adiciona essa estatística como prioridade
  if (overdue > 0) {
    stats.splice(1, 0, {
      title: 'PDIs em Atraso',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    });
  }

  return (
    <div className={`grid gap-6 ${
      stats.length === 5 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PDIStats; 