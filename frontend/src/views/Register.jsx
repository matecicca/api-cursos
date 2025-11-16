import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Register(){
  const [form, setForm] = useState({ nombre:'', tipo:'alumno', email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateNombre = (value) => {
    if (!value || value.trim().length === 0) {
      setNombreError('El nombre es requerido');
      return false;
    }
    if (value.trim().length < 3) {
      setNombreError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    setNombreError('');
    return true;
  };

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

  const handleNombreChange = (e) => {
    const value = e.target.value;
    setForm({...form, nombre: value});
    if (value) validateNombre(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm({...form, email: value});
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setForm({...form, password: value});
    if (value) validatePassword(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');

    const isNombreValid = validateNombre(form.nombre);
    const isEmailValid = validateEmail(form.email);
    const isPasswordValid = validatePassword(form.password);

    if (!isNombreValid || !isEmailValid || !isPasswordValid) return;

    try {
      await api.post('/usuarios', form);
      setMsg('Usuario creado exitosamente. Ahora puedes iniciar sesión.');
      setForm({ nombre:'', tipo:'alumno', email:'', password:'' });
    } catch(e) {
      setErr(e?.response?.data?.msg || 'Error creando usuario');
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="card-body">
          <h2 className="mb-lg">Crear cuenta</h2>

          {err && (
            <div className="alert alert-error mb-lg">
              {err}
            </div>
          )}

          {msg && (
            <div className="alert alert-success mb-lg">
              {msg}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={form.nombre}
                onChange={handleNombreChange}
                className={`form-control ${nombreError ? 'is-invalid' : ''}`}
              />
              {nombreError && <small className="form-error">{nombreError}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
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
                value={form.password}
                onChange={handlePasswordChange}
                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
              />
              {passwordError && <small className="form-error">{passwordError}</small>}
              {!passwordError && <small className="form-text">Mínimo 6 caracteres</small>}
            </div>

            <div className="form-group">
              <label htmlFor="tipo" className="form-label">
                Tipo de usuario
              </label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={e => setForm({...form, tipo:e.target.value})}
                className="form-select"
              >
                <option value="alumno">Alumno</option>
                <option value="docente">Docente</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-md"
            >
              Crear cuenta
            </button>

            <div className="text-center">
              <span className="text-muted">¿Ya tienes cuenta? </span>
              <Link to="/login" className="btn-tertiary">
                Inicia sesión aquí
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
          max-width: 450px;
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

        .alert-success {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid var(--success);
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
