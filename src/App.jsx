import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SessionsList from './pages/SessionsList.jsx';
import SessionRun from './pages/SessionRun.jsx';
import CompetenciesView from './pages/CompetenciesView.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import MatrixView from './pages/MatrixView.jsx';
import LearnerTraining from './pages/LearnerTraining.jsx';
import SupervisorTraining from './pages/SupervisorTraining.jsx';
import Layout from './components/Layout.jsx';
import RequireRole from './components/RequireRole.jsx';
import { useMe } from './auth.js';

export default function App() {
  const loggedIn = Boolean(localStorage.getItem('token'));
  const { me, loading, error } = useMe();

  if (!loggedIn) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );

  if (loading) return (
    <div className="container">
      <div className="card"><p>Loading...</p></div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="card">
        <div className="h2">LMS core unavailable</div>
        <p className="small">{error}. Please try again shortly.</p>
      </div>
    </div>
  );

  if (!me) return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );

  return (
    <Layout me={me}>
      <Routes>
        <Route path="/" element={<Dashboard me={me} />} />

        <Route
          path="/supervisor/sessions"
          element={
            <RequireRole me={me} roles={['SUPERVISOR', 'ADMIN']}>
              <SessionsList />
            </RequireRole>
          }
        />
        <Route
          path="/supervisor/sessions/:id"
          element={
            <RequireRole me={me} roles={['SUPERVISOR', 'ADMIN']}>
              <SessionRun />
            </RequireRole>
          }
        />
        <Route
          path="/supervisor/training"
          element={
            <RequireRole me={me} roles={['SUPERVISOR', 'ADMIN']}>
              <SupervisorTraining />
            </RequireRole>
          }
        />
        <Route
          path="/supervisor/competencies"
          element={
            <RequireRole me={me} roles={['SUPERVISOR', 'ADMIN']}>
              <CompetenciesView />
            </RequireRole>
          }
        />
        <Route
          path="/supervisor/matrix"
          element={
            <RequireRole me={me} roles={['SUPERVISOR', 'ADMIN']}>
              <MatrixView />
            </RequireRole>
          }
        />
        <Route
          path="/my-learning"
          element={
            <RequireRole me={me} roles={['LEARNER']}>
              <LearnerTraining />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole me={me} roles={['ADMIN']}>
              <AdminUsers />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
