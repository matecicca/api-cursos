import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Cursos(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const esAlumno = user?.tipo === 'alumno';

  const load = () => {
    setLoading(true);
    api.get('/cursos')
      .then(({data}) => setItems(Array.isArray(data) ? data : []))
      .catch(e => setErr('No se pudo cargar la lista de cursos'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const inscribirse = async (cursoId) => {
    if (!window.confirm('¿Deseas inscribirte a este curso?')) return;
    setErr('');
    setSuccess('');
    try {
      await api.post('/inscripciones', {
        alumno: user.id,
        curso: cursoId
      });
      setSuccess('Inscripción realizada exitosamente');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e) {
      const msg = e?.response?.data?.mensaje || 'Error al inscribirse';
      setErr(msg);
    }
  };

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
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2 className="mb-sm">Cursos disponibles</h2>
          <p className="text-muted">
            <strong>Usuario:</strong> {user?.nombre}
            <span className={`badge badge-${
              user?.tipo === 'admin' ? 'error' :
              user?.tipo === 'docente' ? 'secondary' :
              'primary'
            } ml-sm`} style={{marginLeft: 'var(--spacing-sm)'}}>
              {user?.tipo}
            </span>
          </p>
        </div>
      </div>

      {err && (
        <div className="alert alert-error mb-lg">
          {err}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-lg">
          {success}
        </div>
      )}

      {!loading && !items.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No hay cursos disponibles</h3>
          <p className="empty-state-message">
            Aún no hay cursos creados en el sistema.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Docente</th>
                <th>Fecha</th>
                <th>Código</th>
                {esAlumno && <th className="text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td>{c.descripcion}</td>
                  <td>
                    {typeof c.docente === 'object' ? (c.docente?.nombre || c.docente) : c.docente}
                  </td>
                  <td>
                    {c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  <td>
                    <code className="code-badge">{c.classCode}</code>
                  </td>
                  {esAlumno && (
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => inscribirse(c._id)}
                          className="btn btn-primary btn-sm"
                        >
                          Inscribirse
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
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

        .code-badge {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          background-color: var(--bg);
          color: var(--title);
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: var(--text-xs);
          font-weight: 600;
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
