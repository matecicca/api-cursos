import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home(){
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/health')
      .then(r => setHealth(r.data))
      .catch(e => setErr('No se pudo obtener el estado del servidor'));
  }, []);

  return (
    <section>
      <div className="hero mb-2xl">
        <h1>Bienvenido a App Cursos</h1>
        <p className="hero-subtitle">
          Sistema de gestión de cursos y usuarios
        </p>
      </div>

      <div className="card mb-xl">
        <div className="card-header">
          <h3 className="mb-sm">Estado del Servidor</h3>
        </div>
        <div className="card-body">
          {err && (
            <div className="alert alert-error">
              {err}
            </div>
          )}
          {health ? (
            <div className="status-badge">
              <span className="status-dot"></span>
              <span>Servidor en línea</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {user ? (
        <div className="card mb-xl">
          <div className="card-header">
            <h3 className="mb-sm">Usuario Actual</h3>
          </div>
          <div className="card-body">
            <div className="user-info">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{user.nombre}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo/Rol:</span>
                <span className={`badge badge-${
                  user.tipo === 'admin' ? 'error' :
                  user.tipo === 'docente' ? 'secondary' :
                  'primary'
                }`}>
                  {user.tipo}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value text-muted">{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-xl">
          <strong>No hay sesión activa.</strong> Por favor, inicia sesión para continuar.
          <div className="mt-md">
            <Link to="/login" className="btn btn-primary btn-sm">
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .hero {
          text-align: center;
          padding: var(--spacing-2xl) 0;
        }

        .hero h1 {
          font-size: var(--text-3xl);
          margin-bottom: var(--spacing-md);
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          color: var(--muted);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .info-label {
          font-weight: 600;
          color: var(--title);
          min-width: 100px;
        }

        .info-value {
          color: var(--text);
        }

        .alert {
          padding: var(--spacing-lg) var(--spacing-xl);
          border-radius: var(--radius);
          font-size: var(--text-base);
        }

        .alert-warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border: 1px solid var(--warning);
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border: 1px solid var(--error);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background-color: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius);
          color: var(--success);
          font-weight: 500;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          background-color: var(--success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .code-block {
          background-color: var(--bg);
          padding: var(--spacing-lg);
          border-radius: var(--radius);
          overflow-x: auto;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: var(--text-sm);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
          border: 0.25em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border 0.75s linear infinite;
        }

        .text-primary {
          color: var(--primary);
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @keyframes spinner-border {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: var(--text-2xl);
          }

          .info-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .info-label {
            min-width: auto;
          }
        }
      `}</style>
    </section>
  );
}
