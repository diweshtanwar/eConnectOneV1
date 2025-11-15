export interface TicketPriority {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  color: 'success' | 'info' | 'warning' | 'error';
  score: number;
}

export const calculateTicketPriority = (
  amount: number,
  ticketType: 'withdrawal' | 'deposit',
  userRole: string,
  createdHoursAgo: number
): TicketPriority => {
  let score = 0;

  // Amount-based scoring
  if (amount >= 100000) score += 40;
  else if (amount >= 50000) score += 30;
  else if (amount >= 10000) score += 20;
  else score += 10;

  // Type-based scoring (withdrawals are more urgent)
  if (ticketType === 'withdrawal') score += 20;
  else score += 10;

  // User role scoring
  if (userRole === 'CSP') score += 15;
  else score += 5;

  // Time-based urgency
  if (createdHoursAgo >= 24) score += 30;
  else if (createdHoursAgo >= 8) score += 20;
  else if (createdHoursAgo >= 4) score += 10;

  // Determine priority level
  if (score >= 80) return { level: 'URGENT', color: 'error', score };
  if (score >= 60) return { level: 'HIGH', color: 'warning', score };
  if (score >= 40) return { level: 'MEDIUM', color: 'info', score };
  return { level: 'LOW', color: 'success', score };
};

export const sortTicketsByPriority = (tickets: any[]) => {
  return tickets.sort((a, b) => {
    const aPriority = calculateTicketPriority(
      a.withdrawalDetail?.amount || a.depositDetail?.amount || 0,
      a.typeId === 2 ? 'withdrawal' : 'deposit',
      a.raisedByUser?.role || 'CSP',
      Math.floor((Date.now() - new Date(a.createdDate).getTime()) / (1000 * 60 * 60))
    );
    
    const bPriority = calculateTicketPriority(
      b.withdrawalDetail?.amount || b.depositDetail?.amount || 0,
      b.typeId === 2 ? 'withdrawal' : 'deposit',
      b.raisedByUser?.role || 'CSP',
      Math.floor((Date.now() - new Date(b.createdDate).getTime()) / (1000 * 60 * 60))
    );

    return bPriority.score - aPriority.score;
  });
};