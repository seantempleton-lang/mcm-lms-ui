import { useEffect, useState } from 'react';
import { api, resolveApiUrl } from '../api';

function formatFileSize(sizeBytes) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  if (sizeBytes < 1024 * 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function AdminResources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/admin/resources');
      setItems(data || []);
    } catch {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Failed to copy resource URL');
    }
  }

  async function deleteResource(filename) {
    const confirmed = window.confirm(`Delete resource "${filename}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(filename);
    setError('');

    try {
      await api(`/admin/resources/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      setItems((current) => current.filter((item) => item.filename !== filename));
    } catch {
      setError('Failed to delete resource');
    } finally {
      setDeleting('');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Resources</div>
        <p className="small">Browse the documents and media currently stored in the core app persistent storage.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>Stored resources</div>
            <p className="small">These files are served through the core API from `/documents/...`.</p>
          </div>
          <button type="button" className="btn ghost" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <p className="small" style={{ marginTop: 16 }}>Loading resources...</p>
        ) : items.length ? (
          <div className="grid" style={{ gap: 12, marginTop: 16 }}>
            {items.map((item) => (
              <div key={item.filename} className="module-competency-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{item.filename}</div>
                  <div className="small">
                    {formatFileSize(item.sizeBytes)} | Updated {new Date(item.modifiedAt).toLocaleString()}
                  </div>
                  <div className="small" style={{ marginTop: 4, wordBreak: 'break-all' }}>{item.url}</div>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <a className="btn ghost" href={resolveApiUrl(item.url)} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <button type="button" className="btn ghost" onClick={() => copyUrl(item.url)}>
                    {copied === item.url ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    disabled={deleting === item.filename}
                    onClick={() => deleteResource(item.filename)}
                  >
                    {deleting === item.filename ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="small" style={{ marginTop: 16 }}>No stored resources found yet.</p>
        )}
      </div>
    </div>
  );
}
