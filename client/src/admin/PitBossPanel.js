import React, { useState } from 'react';

const API_BASE = '/api/pitboss';

export default function PitBossPanel() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [logData, setLogData] = useState('');
  const [response, setResponse] = useState('');
  const [mode, setMode] = useState('ask');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    let url = API_BASE + (mode === 'sql' ? '/sql' : mode === 'logs' ? '/logs' : '/ask');
    let body =
      mode === 'sql'
        ? { nlQuery }
        : mode === 'logs'
        ? { logData }
        : { prompt, context };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResponse(data.answer || data.sql || data.summary || data.error || 'No response');
    } catch (err) {
      setResponse('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',bottom:80,right:24,zIndex:2100,background:'#fff',border:'2px solid #222',borderRadius:12,padding:24,width:400,maxWidth:'90vw',boxShadow:'0 4px 24px #0002'}}>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <button onClick={()=>setMode('ask')} style={{fontWeight:mode==='ask'?'bold':'normal'}}>Q&A</button>
        <button onClick={()=>setMode('sql')} style={{fontWeight:mode==='sql'?'bold':'normal'}}>SQL</button>
        <button onClick={()=>setMode('logs')} style={{fontWeight:mode==='logs'?'bold':'normal'}}>Logs</button>
      </div>
      <form onSubmit={handleSubmit}>
        {mode==='ask' && (
          <>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ask Pit Boss (admin, docs, support, etc)" rows={3} style={{width:'100%',marginBottom:8}} />
            <input value={context} onChange={e=>setContext(e.target.value)} placeholder="(Optional) Context or extra info" style={{width:'100%',marginBottom:8}} />
          </>
        )}
        {mode==='sql' && (
          <textarea value={nlQuery} onChange={e=>setNlQuery(e.target.value)} placeholder="Describe the SQL you need (e.g. list all players who deposited >$500 in last 7 days)" rows={3} style={{width:'100%',marginBottom:8}} />
        )}
        {mode==='logs' && (
          <textarea value={logData} onChange={e=>setLogData(e.target.value)} placeholder="Paste logs or error output here" rows={6} style={{width:'100%',marginBottom:8}} />
        )}
        <button type="submit" disabled={loading} style={{width:'100%',padding:'8px 0',fontWeight:'bold',background:'#222',color:'#fff',border:'none',borderRadius:6}}>
          {loading ? 'Working...' : 'Submit'}
        </button>
      </form>
      {response && (
        <div style={{marginTop:16,whiteSpace:'pre-wrap',background:'#f7f7f7',padding:12,borderRadius:6,border:'1px solid #eee',maxHeight:200,overflowY:'auto'}}>{response}</div>
      )}
    </div>
  );
}
