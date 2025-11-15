import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Register(){
  const [form, setForm] = useState({ nombre:'', tipo:'alumno', email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!form.email || !form.password) return setErr('Email y password requeridos');
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
                onChange={e => setForm({...form, nombre:e.target.value})}
                required
                className="form-control"
              />
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
                onChange={e => setForm({...form, email:e.target.value})}
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
                value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}
                minLength="6"
                required
                className="form-control"
              />
              <small className="form-text">Mínimo 6 caracteres</small>
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
      `}</style>
    </div>
  );
}
