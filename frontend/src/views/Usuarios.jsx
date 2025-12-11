import { useEffect, useState } from 'react';
import api from '../services/api';

// Colores de borde según el rol
const ROLE_COLORS = {
  admin: '#ef4444',    // rojo
  docente: '#6b7280',  // gris (secondary)
  alumno: '#3b82f6',   // azul (primary)
};

export default function Usuarios(){
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/usuarios')
      .then(({data}) => { if(active) setItems(data || []); })
      .catch(e => setErr(e?.response?.data?.msg || 'No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
    return () => { active = false; }
  }, []);

  const getRoleColor = (tipo) => ROLE_COLORS[tipo] || ROLE_COLORS.alumno;

  if (loading) {
    return (
      <div className="text-center p-xl">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-xl">
        <h2 className="mb-sm">Usuarios</h2>
      </div>

      {err && (
        <div className="alert alert-error mb-lg">
          {err}
        </div>
      )}

      {!loading && !items.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No hay usuarios</h3>
          <p className="empty-state-message">
            Aún no hay usuarios registrados en el sistema.
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {items.map(u => (
            <div
              key={u._id}
              className="user-card"
              style={{ borderColor: getRoleColor(u.tipo) }}
            >
              <div className="user-card-header">
                <h3 className="user-name">{u.nombre}</h3>
                <span
                  className="user-role"
                  style={{ backgroundColor: getRoleColor(u.tipo) }}
                >
                  {u.tipo}
                </span>
              </div>
              <p className="user-email">{u.email}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .user-card {
          background-color: var(--surface);
          border: 3px solid;
          border-radius: var(--radius-lg, 12px);
          padding: var(--spacing-md);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }

        .user-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .user-name {
          font-size: var(--text-md, 1rem);
          font-weight: 600;
          color: var(--title);
          margin: 0;
        }

        .user-role {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          color: white;
          border-radius: var(--radius);
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: capitalize;
        }

        .user-email {
          color: var(--muted);
          font-size: var(--text-xs);
          margin: 0;
          word-break: break-all;
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
      `}</style>
    </section>
  );
}
