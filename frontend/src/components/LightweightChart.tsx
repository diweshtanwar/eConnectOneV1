import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface LightweightChartProps {
  data: ChartData[];
  type: 'donut' | 'bar';
  size?: number;
}

export const LightweightChart: React.FC<LightweightChartProps> = ({ 
  data, 
  type, 
  size = 120 
}) => {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (type === 'donut') {
    let cumulativePercentage = 0;
    const radius = size / 2 - 10;
    const strokeWidth = 8;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.palette.divider}
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDasharray = `${percentage * 2.51} 251`;
            const strokeDashoffset = -cumulativePercentage * 2.51;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dy="0.3em"
            fontSize="18"
            fontWeight="600"
            fill={theme.palette.text.primary}
          >
            {total}
          </text>
        </svg>
        <Box>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  mr: 1
                }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {item.label}: {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <Box sx={{ width: '100%' }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 6,
                backgroundColor: theme.palette.divider,
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: 3,
                  transition: 'width 0.5s ease'
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};