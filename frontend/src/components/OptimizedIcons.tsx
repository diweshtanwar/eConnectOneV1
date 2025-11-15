import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

// Lightweight custom icons to reduce bundle size
export const DashboardIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </SvgIcon>
);

export const PeopleIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10l.94 2.07c.08.16.22.28.39.32l2.67.67V22h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-2C3.67 8 2.4 9.24 2.05 10.8L2 22h2v-7h2v7h2l-.95-11.2A3 3 0 0 1 7 8z"/>
  </SvgIcon>
);

export const TicketIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M20 12c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm-2-6H6c-1.1 0-2 .9-2 2v3c.55 0 1 .45 1 1s-.45 1-1 1v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3c-.55 0-1-.45-1-1s.45-1 1-1V8c0-1.1-.9-2-2-2z"/>
  </SvgIcon>
);

export const AddIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </SvgIcon>
);

export const DocumentIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
  </SvgIcon>
);

export const HistoryIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </SvgIcon>
);

export const ProfileIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </SvgIcon>
);

export const ViewIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </SvgIcon>
);

export const DownloadIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </SvgIcon>
);

export const DeleteIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon {...props}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </SvgIcon>
);