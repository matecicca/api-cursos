import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Email y password requeridos');
    try {
      setLoading(true);
      const { data } = await api.post('/usuarios/auth', { email, password });
      const token = data?.token;
      const user = data?.user;
      if (!token || !user) throw new Error('Respuesta sin token o usuario');
      login(user, token);
      nav('/');
    } catch(e) {
      setErr(e?.response?.data?.msg || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="card-body">
          <h2 className="mb-lg">Iniciar sesión</h2>

          {err && (
            <div className="alert alert-error mb-lg">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength="6"
                required
                className="form-control"
              />
              <small className="form-text">Mínimo 6 caracteres</small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 mb-md"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>

            <div className="text-center">
              <span className="text-muted">¿No tienes cuenta? </span>
              <Link to="/register" className="btn-tertiary">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
        }

        .alert {
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius);
          font-size: var(--text-sm);
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid var(--error);
        }

        .w-100 {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
