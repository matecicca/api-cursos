import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
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

export default function MisCursos() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);

  const esDocente = user?.tipo === 'docente';
  const esAlumno = user?.tipo === 'alumno';

  // Generar colores aleatorios para cada curso (memorizados por ID)
  const cardColors = useMemo(() => {
    const colors = {};
    misCursos.forEach(curso => {
      colors[curso._id] = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
    });
    return colors;
  }, [misCursos]);

  useEffect(() => {
    if (!user || (user.tipo !== 'docente' && user.tipo !== 'alumno')) {
      navigate('/');
      return;
    }
    cargarMisCursos();
  }, [user, navigate]);

  const cargarMisCursos = async () => {
    try {
      setLoading(true);

      if (esDocente) {
        // Filtrar cursos donde el docente sea el usuario actual
        const res = await api.get(`/cursos?docente=${user.id}`);
        setMisCursos(res.data);
      } else if (esAlumno) {
        // Obtener inscripciones del alumno y poblar con datos de curso
        const inscripcionesRes = await api.get('/inscripciones');
        const misInscripciones = inscripcionesRes.data.filter(
          insc => insc.alumno?._id === user.id || insc.alumno === user.id
        );

        // Cargar datos completos de cada curso
        const cursosPromises = misInscripciones.map(async (insc) => {
          const cursoId = typeof insc.curso === 'object' ? insc.curso._id : insc.curso;
          const cursoRes = await api.get(`/cursos/${cursoId}`);
          return {
            ...cursoRes.data,
            inscripcionId: insc._id,
            fechaInscripcion: insc.createdAt
          };
        });

        const cursosCompletos = await Promise.all(cursosPromises);
        setMisCursos(cursosCompletos);
      }

      setLoading(false);
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al cargar los cursos');
      setLoading(false);
    }
  };

  const verAlumnos = async (cursoId, curso) => {
    try {
      setCursoSeleccionado(curso);
      const res = await api.get(`/cursos/${cursoId}/alumnos`);
      setAlumnosInscritos(res.data);
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al cargar alumnos');
    }
  };

  const cerrarDetalles = () => {
    setCursoSeleccionado(null);
    setAlumnosInscritos([]);
  };

  const cancelarInscripcion = async (inscripcionId) => {
    if (!window.confirm('¿Cancelar esta inscripción?')) return;
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      showSuccess('Inscripción cancelada exitosamente');
      // Recargar alumnos del curso seleccionado
      if (cursoSeleccionado) {
        verAlumnos(cursoSeleccionado._id, cursoSeleccionado);
      }
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al cancelar inscripción');
    }
  };

  const desinscribirse = async (inscripcionId) => {
    if (!window.confirm('¿Estás seguro de que quieres desinscribirte de este curso?')) return;
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      showSuccess('Te has desinscrito exitosamente');
      // Recargar la lista de cursos del alumno
      cargarMisCursos();
      cerrarDetalles();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al desinscribirse');
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
          <h2 className="mb-sm">Mis Cursos</h2>
          <p className="text-muted">
            <strong>Usuario:</strong> {user?.nombre}
            <span className={`badge badge-${
              user?.tipo === 'docente' ? 'secondary' : 'primary'
            } ml-sm`} style={{marginLeft: 'var(--spacing-sm)'}}>
              {user?.tipo}
            </span>
          </p>
        </div>
      </div>

      {misCursos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">
            {esDocente ? 'No tienes cursos asignados' : 'No estás inscrito en ningún curso'}
          </h3>
          <p className="empty-state-message">
            {esDocente ? 'Aún no tienes cursos asignados como docente.' : 'Inscríbete a un curso para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {misCursos.map(curso => (
            <div
              key={curso._id}
              className="course-card"
              style={{ borderColor: cardColors[curso._id] }}
            >
              <div className="course-card-header">
                <span className="course-code">{curso.classCode}</span>
                <h3 className="course-title">{curso.nombre}</h3>
                <p className="course-description">{curso.descripcion || 'Sin descripción'}</p>
              </div>

              <div className="course-info">
                {esAlumno && (
                  <div className="course-info-item">
                    <span className="course-label">Docente:</span>
                    <span className="course-value">
                      {typeof curso.docente === 'object' ? curso.docente?.nombre : curso.docente}
                    </span>
                  </div>
                )}
                <div className="course-info-item">
                  <span className="course-label">Fecha:</span>
                  <span className="course-value">
                    {curso.fecha ? new Date(curso.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </span>
                </div>
                {esAlumno && curso.fechaInscripcion && (
                  <div className="course-info-item">
                    <span className="course-label">Inscrito:</span>
                    <span className="course-value">
                      {new Date(curso.fechaInscripcion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="course-card-footer">
                <button
                  onClick={() => verAlumnos(curso._id, curso)}
                  className="btn btn-secondary"
                  style={{width: '100%', marginBottom: 'var(--spacing-sm)'}}
                >
                  👥 Ver Alumnos
                </button>
                {esAlumno && (
                  <button
                    onClick={() => desinscribirse(curso.inscripcionId)}
                    className="btn btn-error"
                    style={{width: '100%'}}
                  >
                    Desinscribirse
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cursoSeleccionado && createPortal(
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">👥 Alumnos Inscritos</h2>
                <p className="modal-subtitle">{cursoSeleccionado.nombre}</p>
              </div>
              <button
                onClick={cerrarDetalles}
                className="modal-close"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {alumnosInscritos.length === 0 ? (
                <div className="empty-state-modal">
                  <div className="empty-state-icon">👤</div>
                  <h3 className="empty-state-title">No hay alumnos inscritos</h3>
                  <p className="empty-state-message">
                    Aún no hay alumnos inscritos en este curso.
                  </p>
                </div>
              ) : (
                <div className="students-list">
                  {alumnosInscritos.map(item => (
                    <div key={item.inscripcionId} className="student-card">
                      <div className="student-info">
                        <div className="student-avatar">
                          {item.alumno.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-details">
                          <h4 className="student-name">{item.alumno.nombre}</h4>
                          <p className="student-email">{item.alumno.email}</p>
                          <p className="student-date">
                            📅 Inscrito: {new Date(item.fechaInscripcion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {esDocente && (
                        <button
                          onClick={() => cancelarInscripcion(item.inscripcionId)}
                          className="btn btn-warning btn-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: var(--spacing-lg);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: var(--spacing-xl);
          border-bottom: 2px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--title);
          margin: 0;
          margin-bottom: var(--spacing-xs);
        }

        .modal-subtitle {
          font-size: var(--text-base);
          color: var(--muted);
          margin: 0;
          font-weight: 500;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: var(--muted);
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background-color: var(--bg);
          color: var(--error);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: var(--spacing-xl);
          overflow-y: auto;
          flex: 1;
        }

        .empty-state-modal {
          text-align: center;
          padding: var(--spacing-2xl) var(--spacing-xl);
        }

        .empty-state-modal .empty-state-icon {
          font-size: 64px;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state-modal .empty-state-title {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--title);
          margin-bottom: var(--spacing-sm);
        }

        .empty-state-modal .empty-state-message {
          color: var(--muted);
          font-size: var(--text-base);
        }

        .students-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .student-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-lg);
          background: white;
          border: 2px solid var(--border);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .student-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          flex: 1;
        }

        .student-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .student-details {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--title);
          margin: 0;
          margin-bottom: var(--spacing-xs);
        }

        .student-email {
          font-size: var(--text-sm);
          color: var(--muted);
          margin: 0;
          margin-bottom: var(--spacing-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .student-date {
          font-size: var(--text-xs);
          color: var(--muted);
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0;
          }

          .modal-content {
            max-height: 100vh;
            border-radius: 0;
          }

          .modal-header {
            padding: var(--spacing-lg);
          }

          .modal-body {
            padding: var(--spacing-lg);
          }

          .student-card {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .student-info {
            width: 100%;
          }

          .student-card .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
