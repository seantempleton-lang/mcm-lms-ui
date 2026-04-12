import { useEffect, useState } from 'react';
import { api, clearToken } from './api';
export function useMe(){
  const [me,setMe]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{ const d=await api('/auth/me'); if(alive) setMe(d); }
      catch{ clearToken(); if(alive) setMe(null); }
      finally{ if(alive) setLoading(false); }
    })();
    return ()=>{alive=false};
  },[]);
  return { me, loading };
}
