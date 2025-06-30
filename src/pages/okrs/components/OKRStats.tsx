import React from 'react';
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import type { OKRSummary } from '../../../types/okrs';

interface OKRStatsProps {
  okrs: OKRSummary[];
}

const OKRStats: React.FC<OKRStatsProps> = ({ okrs }) => {
  const stats = React.useMemo(() => {
    const total = okrs.length;
    const completed = okrs.filter(okr => okr.status === 'COMPLETED' || okr.overallProgress >= 100).length;
    const active = okrs.filter(okr => okr.status === 'ACTIVE' && okr.overallProgress < 100).length;
    const paused = okrs.filter(okr => okr.status === 'PAUSED').length;
    
    const totalProgress = okrs.reduce((sum, okr) => sum + okr.overallProgress, 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    return {
      total,
      active,
      completed,
      paused,
      averageProgress
    };
  }, [okrs]);

  const statCards = [
    {
      title: 'Total de OKRs',
      value: stats.total,
      icon: Target,
          color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700'
    },
    {
      title: 'OKRs Ativos',
      value: stats.active,
      icon: Clock,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'OKRs Concluídos',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Progresso Médio',
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.title}
            className={`${stat.bgColor} p-6 rounded-lg border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OKRStats; 