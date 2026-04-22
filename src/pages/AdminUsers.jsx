import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { name: '', username: '', email: '', role: 'LEARNER', password: '' };

function buildUsernameFromName(name = '') {
  return name.trim().replace(/[^A-Za-z0-9]+/g, '') || '';
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 520 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="h2" style={{ margin: 0 }}>{title}</div>
          <button className="btn ghost" onClick={onClose}>X</button>
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
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [resetResult, setResetResult] = useState(null);
  const [copiedReset, setCopiedReset] = useState(false);

  async function load(search = '') {
    setLoading(true);
    setErr('');
    try {
      const data = await api(`/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`);
      setUsers(data || []);
    } catch {
      setErr('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(emptyForm);
    setFormErr('');
    setModal('create');
  }

  function openEdit(user) {
    setSelected(user);
    setForm({
      name: user.name,
      username: user.username || buildUsernameFromName(user.name),
      email: user.email || '',
      role: user.role,
      password: '',
    });
    setFormErr('');
    setModal('edit');
  }

  function openDelete(user) {
    setSelected(user);
    setModal('delete');
  }

  function openReset(user) {
    setSelected(user);
    setFormErr('');
    setResetResult(null);
    setCopiedReset(false);
    setModal('reset');
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
    setFormErr('');
    setResetResult(null);
    setCopiedReset(false);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormErr('');
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          email: form.email.trim() || undefined,
        }),
      });
      closeModal();
      await load(q);
    } catch (error) {
      setFormErr(error.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(event) {
    event.preventDefault();
    setSaving(true);
    setFormErr('');
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email.trim() || null,
      role: form.role,
    };
    if (form.password) payload.password = form.password;
    try {
      await api(`/admin/users/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      closeModal();
      await load(q);
    } catch (error) {
      setFormErr(error.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api(`/admin/users/${selected.id}`, { method: 'DELETE' });
      closeModal();
      await load(q);
    } catch (error) {
      setErr(error.message || 'Failed to delete user');
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    setSaving(true);
    setFormErr('');
    try {
      const result = await api(`/admin/users/${selected.id}/reset-password`, { method: 'POST' });
      setResetResult(result);
      await load(q);
    } catch (error) {
      setFormErr(error.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  }

  async function copyResetPassword() {
    if (!resetResult?.password) return;
    try {
      await navigator.clipboard.writeText(resetResult.password);
      setCopiedReset(true);
      window.setTimeout(() => setCopiedReset(false), 1600);
    } catch {
      setFormErr('Failed to copy password');
    }
  }

  const roleBadgeColor = (role) => ({
    ADMIN: 'var(--bad)', SUPERVISOR: 'var(--warn)', LEARNER: 'var(--good)',
  })[role] || 'var(--muted)';

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h1">User Management</div>
            <p className="small">Create, edit, reset passwords, and manage LMS user accounts.</p>
          </div>
          <button className="btn" onClick={openCreate}>+ New user</button>
        </div>
        {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
      </div>

      <div className="card">
        <div className="row" style={{ alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Search by name or username..."
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && load(q)}
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
                {['Name', 'Username', 'Role', 'Created', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="th"
                    style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '0.85rem' }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="tr" style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    {user.email && <div className="small">{user.email}</div>}
                  </td>
                  <td style={{ padding: '10px 12px' }} className="small">{user.username}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge" style={{ color: roleBadgeColor(user.role), borderColor: `${roleBadgeColor(user.role)}55` }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }} className="small">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn ghost" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => openEdit(user)}>
                        Edit
                      </button>
                      <button className="btn ghost" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => openReset(user)}>
                        Reset password
                      </button>
                      <button
                        className="btn ghost"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--bad)', borderColor: 'rgba(248,113,113,0.3)' }}
                        onClick={() => openDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center' }} className="small">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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

      {modal === 'edit' && selected && (
        <Modal title={`Edit - ${selected.name}`} onClose={closeModal}>
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

      {modal === 'reset' && selected && (
        <Modal title={`Reset password - ${selected.name}`} onClose={closeModal}>
          <div className="grid">
            <p>
              Reset the password for <strong>{selected.name}</strong> (`{selected.username}`).
              The server will generate a new 10-character password.
            </p>
            {!resetResult ? (
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
                <button className="btn" disabled={saving} onClick={handleResetPassword}>
                  {saving ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            ) : (
              <>
                <div className="card" style={{ background: 'var(--panel2)' }}>
                  <div className="small" style={{ marginBottom: 8 }}>New temporary password</div>
                  <div className="h2" style={{ margin: 0 }}>{resetResult.password}</div>
                </div>
                {formErr && <p style={{ color: 'var(--bad)', fontSize: '0.9rem' }}>{formErr}</p>}
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn ghost" onClick={copyResetPassword}>
                    {copiedReset ? 'Copied' : 'Copy password'}
                  </button>
                  <button type="button" className="btn" onClick={closeModal}>Done</button>
                </div>
              </>
            )}
            {!resetResult && formErr && <p style={{ color: 'var(--bad)', fontSize: '0.9rem' }}>{formErr}</p>}
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Delete user" onClose={closeModal}>
          <p style={{ marginBottom: 20 }}>
            Are you sure you want to delete <strong>{selected.name}</strong>?
            This cannot be undone.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={closeModal}>Cancel</button>
            <button
              className="btn"
              disabled={saving}
              style={{ background: 'var(--bad)', color: '#fff' }}
              onClick={handleDelete}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UserFormFields({ form, setForm, isCreate }) {
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function handleNameChange(value) {
    setForm((current) => {
      const suggestedUsername = buildUsernameFromName(value);
      const currentSuggested = buildUsernameFromName(current.name);
      const shouldRefreshUsername = !current.username || current.username === currentSuggested;

      return {
        ...current,
        name: value,
        username: shouldRefreshUsername ? suggestedUsername : current.username,
      };
    });
  }

  return (
    <>
      <div>
        <label className="small">Full name</label>
        <input className="input" required value={form.name} onChange={(event) => handleNameChange(event.target.value)} />
      </div>
      <div>
        <label className="small">Username</label>
        <input className="input" required value={form.username} onChange={(event) => updateField('username', event.target.value.replace(/[^A-Za-z0-9]/g, ''))} />
        <p className="small" style={{ marginTop: 8 }}>Use letters and numbers only. Suggested format: `FirstnameLastname`.</p>
      </div>
      <div>
        <label className="small">Email (optional)</label>
        <input className="input" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
      </div>
      <div>
        <label className="small">Role</label>
        <select className="input" value={form.role} onChange={(event) => updateField('role', event.target.value)}>
          {['ADMIN', 'SUPERVISOR', 'LEARNER'].map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="small">{isCreate ? 'Password' : 'New password (leave blank to keep current)'}</label>
        <input
          className="input"
          type="password"
          required={isCreate}
          minLength={8}
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
        />
      </div>
    </>
  );
}
