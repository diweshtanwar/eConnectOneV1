import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
  trend
}) => {
  const theme = useTheme();
  const cardColor = color || theme.palette.primary.main;

  return (
    <Card 
      sx={{ 
        height: 120,
        minHeight: 120,
        background: `linear-gradient(135deg, ${cardColor}15 0%, ${cardColor}05 100%)`,
        border: `1px solid ${cardColor}30`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ p: 1.5, height: '100%', '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              sx={{ 
                fontSize: '0.7rem', 
                mb: 0.5,
                fontWeight: 500,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.4rem',
                color: cardColor,
                mb: 0.25,
                lineHeight: 1.2,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ 
                  fontSize: '0.65rem',
                  display: 'block',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}
                >
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box 
              sx={{ 
                color: cardColor,
                opacity: 0.6,
                fontSize: '1.5rem',
                flexShrink: 0,
                ml: 1
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};