import { useState, useEffect } from 'react';

interface LookupItem {
  id: number;
  name: string;
}

interface LookupData {
  ticketStatuses: LookupItem[];
  problemTypes: LookupItem[];
  loading: boolean;
  error: string | null;
}

// Cache lookup data globally to avoid repeated requests
let cachedLookupData: Omit<LookupData, 'loading' | 'error'> | null = null;

export const useLookupData = (): LookupData => {
  const [data, setData] = useState<LookupData>({
    ticketStatuses: cachedLookupData?.ticketStatuses || [],
    problemTypes: cachedLookupData?.problemTypes || [],
    loading: !cachedLookupData,
    error: null,
  });

  useEffect(() => {
    if (cachedLookupData) {
      return; // Use cached data
    }

    const fetchLookupData = async () => {
      try {
        // TODO: Replace with actual API calls when backend endpoints are available
        // const [statusesResponse, typesResponse] = await Promise.all([
        //   api.get('/lookups/ticket-statuses'),
        //   api.get('/lookups/problem-types')
        // ]);
        
        const lookupData = {
          ticketStatuses: [
            { id: 1, name: 'New' },
            { id: 2, name: 'Pending' },
            { id: 3, name: 'In Progress' },
            { id: 4, name: 'Resolved' },
            { id: 5, name: 'Closed' },
          ],
          problemTypes: [
            { id: 1, name: 'Software Bug' },
            { id: 2, name: 'Hardware Issue' },
            { id: 3, name: 'Network Problem' },
          ],
        };

        cachedLookupData = lookupData;
        setData({
          ...lookupData,
          loading: false,
          error: null,
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load lookup data',
        }));
      }
    };

    fetchLookupData();
  }, []);

  return data;
};