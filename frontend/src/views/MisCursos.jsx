import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
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
              </div>

              <p className="course-description">{curso.descripcion || 'Sin descripción'}</p>

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

      {cursoSeleccionado && (
        <div>
          <hr style={{margin:'30px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h2 style={{margin: 0}}>Alumnos Inscritos en: {cursoSeleccionado.nombre}</h2>
            <button
              onClick={cerrarDetalles}
              className="btn btn-secondary btn-sm"
            >
              Cerrar
            </button>
          </div>

          {alumnosInscritos.length === 0 ? (
            <p>No hay alumnos inscritos en este curso.</p>
          ) : (
            <table border="1" cellPadding="10" style={{borderCollapse:'collapse', width:'100%'}}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha de Inscripción</th>
                  {esDocente && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {alumnosInscritos.map(item => (
                  <tr key={item.inscripcionId}>
                    <td>{item.alumno.nombre}</td>
                    <td>{item.alumno.email}</td>
                    <td>{new Date(item.fechaInscripcion).toLocaleDateString()}</td>
                    {esDocente && (
                      <td>
                        <button
                          onClick={() => cancelarInscripcion(item.inscripcionId)}
                          className="btn btn-warning btn-sm"
                        >
                          Cancelar Inscripción
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

        .btn {
          display: inline-block;
          padding: var(--spacing-md) var(--spacing-lg);
          font-size: var(--text-base);
          font-weight: 600;
          line-height: 1.5;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          border: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
        }

        .btn-sm {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
        }

        .btn-primary {
          background-color: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: #3b82f6;
        }

        .btn-info {
          background-color: #0ea5e9;
          color: white;
        }

        .btn-info:hover {
          background-color: #0284c7;
        }

        .btn-success {
          background-color: var(--success);
          color: white;
        }

        .btn-success:hover {
          background-color: #059669;
        }

        .btn-warning {
          background-color: #f59e0b;
          color: white;
        }

        .btn-warning:hover {
          background-color: #d97706;
        }

        .btn-error {
          background-color: var(--error);
          color: white;
        }

        .btn-error:hover {
          background-color: #dc2626;
        }

        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn:disabled:hover {
          transform: none;
          box-shadow: none;
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
