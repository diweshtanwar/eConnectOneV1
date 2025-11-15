import { useTheme, useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return {
    isMobile,
    isTablet, 
    isDesktop,
    // Helper functions
    getGridProps: (mobile: number = 12, tablet: number = 6, desktop: number = 4) => ({
      xs: mobile,
      sm: tablet,
      md: desktop
    }),
    getSpacing: () => isMobile ? 2 : 3,
    getDialogProps: () => ({
      fullScreen: isMobile,
      maxWidth: isMobile ? false : 'md' as const
    })
  };
};