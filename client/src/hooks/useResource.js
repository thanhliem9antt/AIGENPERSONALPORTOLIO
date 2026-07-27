import { useCallback, useEffect, useState } from 'react';
import api from '../api/axiosClient';

export default function useResource(url, key = 'items') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data[key]);
    } catch (requestError) {
      setError(requestError);
    }
    finally { setLoading(false); }
  }, [url, key]);
  useEffect(() => { load(); }, [load]);
  return { data, setData, loading, error, reload: load };
}
