import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h1>Mis Cursos</h1>
      <p>Bienvenido, {user?.nombre} ({esDocente ? 'Docente' : 'Alumno'})</p>

      {misCursos.length === 0 ? (
        <p>{esDocente ? 'No tienes cursos asignados.' : 'No estás inscrito en ningún curso.'}</p>
      ) : (
        <div>
          <h2>{esDocente ? 'Cursos Asignados' : 'Cursos en los que estás inscrito'} ({misCursos.length})</h2>
          <table border="1" cellPadding="10" style={{borderCollapse:'collapse', width:'100%', marginBottom:30}}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                {esAlumno && <th>Docente</th>}
                <th>Fecha</th>
                <th>Code</th>
                {esAlumno && <th>Fecha Inscripción</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {misCursos.map(curso => (
                <tr key={curso._id}>
                  <td>{curso.nombre}</td>
                  <td>{curso.descripcion}</td>
                  {esAlumno && (
                    <td>{typeof curso.docente === 'object' ? curso.docente?.nombre : curso.docente}</td>
                  )}
                  <td>{curso.fecha ? new Date(curso.fecha).toLocaleString() : '-'}</td>
                  <td>{curso.classCode}</td>
                  {esAlumno && (
                    <td>{curso.fechaInscripcion ? new Date(curso.fechaInscripcion).toLocaleDateString() : '-'}</td>
                  )}
                  <td>
                    <button onClick={() => verAlumnos(curso._id, curso)} className="btn btn-info btn-sm" style={{marginRight: '5px'}}>
                      Ver Alumnos
                    </button>
                    {esAlumno && (
                      <button
                        onClick={() => desinscribirse(curso.inscripcionId)}
                        className="btn btn-danger btn-sm"
                      >
                        Desinscribirse
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

        .btn:active {
          transform: translateY(0);
        }

        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: var(--text-xs);
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

        .btn-danger {
          background-color: var(--error);
          color: white;
        }

        .btn-danger:hover {
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
      `}</style>
    </section>
  );
}
