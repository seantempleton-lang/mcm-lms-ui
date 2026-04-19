import { useEffect, useState } from 'react';
import { api } from '../api';

const ROLES = ['ADMIN', 'SUPERVISOR', 'LEARNER'];

const emptyForm = { name: '', email: '', role: 'LEARNER', password: '' };

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="h2" style={{ margin: 0 }}>{title}</div>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  async function load(search = '') {
    setLoading(true); setErr('');
    try {
      const data = await api(`/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`);
      setUsers(data || []);
    } catch { setErr('Failed to load users'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(emptyForm); setFormErr(''); setModal('create');
  }

  function openEdit(user) {
    setSelected(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setFormErr(''); setModal('edit');
  }

  function openDelete(user) {
    setSelected(user); setModal('delete');
  }

  function closeModal() {
    setModal(null); setSelected(null); setFormErr('');
  }

  async function handleCreate(e) {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      closeModal(); await load(q);
    } catch (ex) {
      setFormErr(ex.message || 'Failed to create user');
    } finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true); setFormErr('');
    // Only send password if filled in
    const payload = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    try {
      await api(`/admin/users/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      closeModal(); await load(q);
    } catch (ex) {
      setFormErr(ex.message || 'Failed to update user');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api(`/admin/users/${selected.id}`, { method: 'DELETE' });
      closeModal(); await load(q);
    } catch (ex) {
      setErr(ex.message || 'Failed to delete user');
      closeModal();
    } finally { setSaving(false); }
  }

  const roleBadgeColor = (role) => ({
    ADMIN: 'var(--bad)', SUPERVISOR: 'var(--warn)', LEARNER: 'var(--good)'
  })[role] || 'var(--muted)';

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h1">User Management</div>
            <p className="small">Create, edit and manage LMS user accounts.</p>
          </div>
          <button className="btn" onClick={openCreate}>+ New user</button>
        </div>
        {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
      </div>

      <div className="card">
        <div className="row" style={{ alignItems: 'center' }}>
          <input
            className="input" style={{ flex: 1 }}
            placeholder="Search by name or email..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(q)}
          />
          <button className="btn secondary" onClick={() => load(q)}>Search</button>
          {q && <button className="btn ghost" onClick={() => { setQ(''); load(''); }}>Clear</button>}
        </div>
      </div>

      <div className="card">
        {loading ? <p className="small">Loading...</p> : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                  <th key={h} className="th" style={{ textAlign: 'left', padding: '8px 12px',
                    borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="tr" style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{user.name}</td>
                  <td style={{ padding: '10px 12px' }} className="small">{user.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge" style={{ color: roleBadgeColor(user.role),
                      borderColor: roleBadgeColor(user.role) + '55' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }} className="small">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn ghost" style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => openEdit(user)}>Edit</button>
                      <button className="btn ghost" style={{ padding: '6px 12px', fontSize: '0.85rem',
                        color: 'var(--bad)', borderColor: 'rgba(248,113,113,0.3)' }}
                        onClick={() => openDelete(user)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }} className="small">
                  No users found.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create modal ── */}
      {modal === 'create' && (
        <Modal title="New user" onClose={closeModal}>
          <form className="grid" onSubmit={handleCreate}>
            <UserFormFields form={form} setForm={setForm} isCreate />
            {formErr && <p style={{ color: 'var(--bad)', fontSize: '0.9rem' }}>{formErr}</p>}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
              <button className="btn" disabled={saving}>
                {saving ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit modal ── */}
      {modal === 'edit' && selected && (
        <Modal title={`Edit — ${selected.name}`} onClose={closeModal}>
          <form className="grid" onSubmit={handleEdit}>
            <UserFormFields form={form} setForm={setForm} isCreate={false} />
            {formErr && <p style={{ color: 'var(--bad)', fontSize: '0.9rem' }}>{formErr}</p>}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
              <button className="btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete confirmation ── */}
      {modal === 'delete' && selected && (
        <Modal title="Delete user" onClose={closeModal}>
          <p style={{ marginBottom: 20 }}>
            Are you sure you want to delete <strong>{selected.name}</strong>?
            This cannot be undone.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={closeModal}>Cancel</button>
            <button className="btn" disabled={saving}
              style={{ background: 'var(--bad)', color: '#fff' }}
              onClick={handleDelete}>
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UserFormFields({ form, setForm, isCreate }) {
  const f = (field, val) => setForm(c => ({ ...c, [field]: val }));
  return (
    <>
      <div>
        <label className="small">Full name</label>
        <input className="input" required value={form.name}
          onChange={e => f('name', e.target.value)} />
      </div>
      <div>
        <label className="small">Email</label>
        <input className="input" type="email" required value={form.email}
          onChange={e => f('email', e.target.value)} />
      </div>
      <div>
        <label className="small">Role</label>
        <select className="input" value={form.role} onChange={e => f('role', e.target.value)}>
          {['ADMIN', 'SUPERVISOR', 'LEARNER'].map(r =>
            <option key={r} value={r}>{r}</option>
          )}
        </select>
      </div>
      <div>
        <label className="small">{isCreate ? 'Password' : 'New password (leave blank to keep current)'}</label>
        <input className="input" type="password" required={isCreate}
          minLength={8} value={form.password}
          onChange={e => f('password', e.target.value)} />
      </div>
    </>
  );
}