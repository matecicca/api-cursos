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
                <p className="course-description">{c.descripcion || 'Sin descripción'}</p>
              </div>

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

    </section>
  );
}
