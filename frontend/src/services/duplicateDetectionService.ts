import { api } from '../api/api';

export interface DuplicateTicket {
  ticketId: string;
  summary: string;
  amount: number;
  createdDate: string;
  status: string;
  ticketType: string;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: DuplicateTicket[];
  warningMessage?: string;
}

class DuplicateDetectionService {
  async checkDuplicateAmount(
    amount: number, 
    ticketType: 'WITHDRAWAL' | 'DEPOSIT',
    userId?: number
  ): Promise<DuplicateCheckResult> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      // Get tickets for today with same amount and type
      const response = await api.get('/api/tickets/duplicate-check', {
        params: {
          amount,
          ticketType: ticketType.toLowerCase(),
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          userId
        }
      });

      const duplicates: DuplicateTicket[] = response.data || [];
      
      if (duplicates.length > 0) {
        const warningMessage = `Found ${duplicates.length} ${ticketType.toLowerCase()} request(s) with the same amount (₹${amount}) created today. Please verify if this is intentional.`;
        
        return {
          hasDuplicates: true,
          duplicates,
          warningMessage
        };
      }

      return {
        hasDuplicates: false,
        duplicates: []
      };
    } catch (error) {
      console.error('Error checking duplicate amounts:', error);
      return {
        hasDuplicates: false,
        duplicates: []
      };
    }
  }

  async getHighlightedTickets(): Promise<DuplicateTicket[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      const response = await api.get('/api/tickets/highlighted-duplicates', {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        }
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching highlighted tickets:', error);
      return [];
    }
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();