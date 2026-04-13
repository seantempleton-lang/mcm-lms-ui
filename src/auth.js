import { useEffect, useState } from 'react';
import { api, clearToken } from './api';
export function useMe(){
  const [me,setMe]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        const d=await api('/auth/me');
        if(alive){ setMe(d); setError(''); }
      }
      catch(err){
        if (err?.status === 401 || err?.status === 403) clearToken();
        if(alive){
          setMe(null);
          setError((err?.status === 401 || err?.status === 403) ? '' : 'Unable to reach LMS core');
        }
      }
      finally{ if(alive) setLoading(false); }
    })();
    return ()=>{alive=false};
  },[]);
  return { me, loading, error };
}
