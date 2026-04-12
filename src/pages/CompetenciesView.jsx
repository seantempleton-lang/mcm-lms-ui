import { useEffect, useState } from 'react';
import { api } from '../api';
export default function CompetenciesView(){
  const [items,setItems]=useState([]);
  const [err,setErr]=useState('');
  useEffect(()=>{ api('/competencies').then(setItems).catch(()=>setErr('Failed to load')) },[]);
  return (
    <div className="grid">
      <div className="card"><div className="h1">Competencies</div><p className="small">Catalogue view</p>{err && <p style={{color:'var(--bad)'}}>{err}</p>}</div>
      <div className="card">
        <table className="table"><thead><tr><th className="th">Code</th><th className="th">Title</th><th className="th">Category</th></tr></thead>
        <tbody>
          {items.map(c=>(<tr key={c.id} className="tr"><td className="td"><strong>{c.code}</strong></td><td className="td">{c.title}</td><td className="td"><span className="badge">{c.category}</span></td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
