import { useState } from 'react';
import { api, setToken } from '../api';
export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  async function submit(e){
    e.preventDefault(); setError('');
    try{
      const data = await api('/auth/login',{ method:'POST', body: JSON.stringify({email,password}) });
      setToken(data.token);
      window.location.href='/';
    }catch{ setError('Login failed'); }
  }
  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <div className="h1">McMillan LMS</div>
        <form onSubmit={submit} className="grid">
          <div><label className="small">Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label className="small">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <button className="btn">Login</button>
          {error && <p style={{color:'var(--bad)'}}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
