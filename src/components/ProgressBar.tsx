import React from 'react';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: string;
  label?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  color = 'bg-blue-600', 
  height = 'h-2',
  label,
  showPercentage = false 
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          {showPercentage && <span>{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`${color} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar; 