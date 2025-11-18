import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const { login } = useAuth();
  const { showError } = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) validatePassword(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      setLoading(true);
      const { data } = await api.post('/usuarios/auth', { email, password });
      const token = data?.token;
      const user = data?.user;
      if (!token || !user) throw new Error('Respuesta sin token o usuario');
      login(user, token);
      nav('/');
    } catch(e) {
      showError(e?.response?.data?.msg || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="card-body">
          <h2 className="mb-lg">Iniciar sesión</h2>

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
                onChange={handleEmailChange}
                className={`form-control ${emailError ? 'is-invalid' : ''}`}
              />
              {emailError && <small className="form-error">{emailError}</small>}
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
                onChange={handlePasswordChange}
                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              />
              {passwordError && <small className="form-error">{passwordError}</small>}
              {!passwordError && <small className="form-text">Mínimo 6 caracteres</small>}
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

        .w-100 {
          width: 100%;
        }

        .form-control.is-invalid {
          border-color: var(--error);
        }

        .form-control.is-invalid:focus {
          border-color: var(--error);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-error {
          display: block;
          margin-top: var(--spacing-xs);
          color: var(--error);
          font-size: var(--text-xs);
        }
      `}</style>
    </div>
  );
}
