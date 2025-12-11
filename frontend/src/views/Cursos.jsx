import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

// Colores para los bordes de las cards
const CARD_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

export default function Cursos(){
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const esAlumno = user?.tipo === 'alumno';

  // Generar colores aleatorios para cada curso (memorizados por ID)
  const cardColors = useMemo(() => {
    const colors = {};
    items.forEach(curso => {
      colors[curso._id] = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
    });
    return colors;
  }, [items]);

  const load = () => {
    setLoading(true);
    api.get('/cursos')
      .then(({data}) => setItems(Array.isArray(data) ? data : []))
      .catch(e => showError('No se pudo cargar la lista de cursos'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const inscribirse = async (cursoId) => {
    if (!window.confirm('¿Deseas inscribirte a este curso?')) return;
    try {
      await api.post('/inscripciones', {
        alumno: user.id,
        curso: cursoId
      });
      showSuccess('Inscripción realizada exitosamente');
      load(); // Recargar la lista de cursos
    } catch (e) {
      const msg = e?.response?.data?.mensaje || 'Error al inscribirse';
      showError(msg);
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

      {!loading && !items.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No hay cursos disponibles</h3>
          <p className="empty-state-message">
            Aún no hay cursos creados en el sistema.
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {items.map(c => (
            <div
              key={c._id}
              className="course-card"
              style={{ borderColor: cardColors[c._id] }}
            >
              <div className="course-card-header">
                <span className="course-code">{c.classCode}</span>
                <h3 className="course-title">{c.nombre}</h3>
              </div>

              <p className="course-description">{c.descripcion || 'Sin descripción'}</p>

              <div className="course-info">
                <div className="course-info-item">
                  <span className="course-label">Docente:</span>
                  <span className="course-value">
                    {typeof c.docente === 'object' ? (c.docente?.nombre || 'N/A') : c.docente}
                  </span>
                </div>
                <div className="course-info-item">
                  <span className="course-label">Fecha:</span>
                  <span className="course-value">
                    {c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </span>
                </div>
              </div>

              {esAlumno && (
                <div className="course-card-footer">
                  <button
                    onClick={() => inscribirse(c._id)}
                    className="btn btn-primary"
                  >
                    Inscribirse
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-xl);
          margin-top: var(--spacing-xl);
        }

        .course-card {
          background: white;
          border: 4px solid;
          border-radius: 16px;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 400px;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .course-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        .course-card-header {
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-bottom: 2px solid var(--border);
        }

        .course-code {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
          padding: 0 16px;
          background-color: white;
          color: var(--title);
          border: 2px solid var(--border);
          border-radius: 12px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: var(--text-lg);
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .course-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--title);
          margin: 0;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .course-description {
          color: var(--muted);
          font-size: var(--text-base);
          line-height: 1.6;
          margin-bottom: var(--spacing-lg);
          flex: 1;
          padding: var(--spacing-lg) var(--spacing-xl);
        }

        .course-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg) var(--spacing-xl);
          background-color: var(--bg);
          border-top: 2px solid var(--border);
        }

        .course-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
          padding: var(--spacing-xs) 0;
        }

        .course-label {
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .course-value {
          color: var(--text);
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .course-card-footer {
          margin-top: auto;
          padding: var(--spacing-lg) var(--spacing-xl);
          padding-top: 0;
        }

        .course-card-footer .btn {
          width: 100%;
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: var(--text-base);
          font-weight: 600;
          border-radius: 12px;
        }

        .btn {
          display: inline-block;
          padding: var(--spacing-sm) var(--spacing-lg);
          font-size: var(--text-sm);
          font-weight: 500;
          line-height: 1.5;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          border: none;
          border-radius: var(--radius);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: #3b82f6;
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
