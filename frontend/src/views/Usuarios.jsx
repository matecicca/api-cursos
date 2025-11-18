import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Usuarios(){
  const { showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/usuarios')
      .then(({data}) => { if(active) setItems(data || []); })
      .catch(e => showError(e?.response?.data?.msg || 'No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
    return () => { active = false; }
  }, [showError]);

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

      {!loading && !items.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No hay usuarios</h3>
          <p className="empty-state-message">
            Aún no hay usuarios registrados en el sistema.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.nombre}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${
                      u.tipo === 'admin' ? 'error' :
                      u.tipo === 'docente' ? 'secondary' :
                      'primary'
                    }`}>
                      {u.tipo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
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
