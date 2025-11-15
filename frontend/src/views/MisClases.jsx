import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MisClases() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [misClases, setMisClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);

  const esDocente = user?.tipo === 'docente';
  const esAlumno = user?.tipo === 'alumno';

  useEffect(() => {
    if (!user || (user.tipo !== 'docente' && user.tipo !== 'alumno')) {
      navigate('/');
      return;
    }
    cargarMisClases();
  }, [user, navigate]);

  const cargarMisClases = async () => {
    try {
      setLoading(true);

      if (esDocente) {
        // Filtrar clases donde el docente sea el usuario actual
        const res = await api.get(`/clases?docente=${user.id}`);
        setMisClases(res.data);
      } else if (esAlumno) {
        // Obtener inscripciones del alumno y poblar con datos de clase
        const inscripcionesRes = await api.get('/inscripciones');
        const misInscripciones = inscripcionesRes.data.filter(
          insc => insc.alumno?._id === user.id || insc.alumno === user.id
        );

        // Cargar datos completos de cada clase
        const clasesPromises = misInscripciones.map(async (insc) => {
          const claseId = typeof insc.clase === 'object' ? insc.clase._id : insc.clase;
          const claseRes = await api.get(`/clases/${claseId}`);
          return {
            ...claseRes.data,
            inscripcionId: insc._id,
            fechaInscripcion: insc.createdAt
          };
        });

        const clasesCompletas = await Promise.all(clasesPromises);
        setMisClases(clasesCompletas);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar las clases');
      setLoading(false);
    }
  };

  const verAlumnos = async (claseId, clase) => {
    try {
      setClaseSeleccionada(clase);
      const res = await api.get(`/clases/${claseId}/alumnos`);
      setAlumnosInscritos(res.data);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar alumnos');
    }
  };

  const cerrarDetalles = () => {
    setClaseSeleccionada(null);
    setAlumnosInscritos([]);
  };

  const cancelarInscripcion = async (inscripcionId) => {
    if (!window.confirm('¿Cancelar esta inscripción?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      setSuccess('Inscripción cancelada exitosamente');
      // Recargar alumnos de la clase seleccionada
      if (claseSeleccionada) {
        verAlumnos(claseSeleccionada._id, claseSeleccionada);
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cancelar inscripción');
    }
  };

  const desinscribirse = async (inscripcionId) => {
    if (!window.confirm('¿Estás seguro de que quieres desinscribirte de esta clase?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      setSuccess('Te has desinscrito exitosamente');
      // Recargar la lista de clases del alumno
      cargarMisClases();
      cerrarDetalles();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al desinscribirse');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h1>Mis Clases</h1>
      <p>Bienvenido, {user?.nombre} ({esDocente ? 'Docente' : 'Alumno'})</p>

      {error && <p style={{color:'red', padding:'10px', backgroundColor:'#fee'}}>{error}</p>}
      {success && <p style={{color:'green', padding:'10px', backgroundColor:'#efe'}}>{success}</p>}

      {misClases.length === 0 ? (
        <p>{esDocente ? 'No tienes clases asignadas.' : 'No estás inscrito en ninguna clase.'}</p>
      ) : (
        <div>
          <h2>{esDocente ? 'Clases Asignadas' : 'Clases en las que estás inscrito'} ({misClases.length})</h2>
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
              {misClases.map(clase => (
                <tr key={clase._id}>
                  <td>{clase.nombre}</td>
                  <td>{clase.descripcion}</td>
                  {esAlumno && (
                    <td>{typeof clase.docente === 'object' ? clase.docente?.nombre : clase.docente}</td>
                  )}
                  <td>{clase.fecha ? new Date(clase.fecha).toLocaleString() : '-'}</td>
                  <td>{clase.classCode}</td>
                  {esAlumno && (
                    <td>{clase.fechaInscripcion ? new Date(clase.fechaInscripcion).toLocaleDateString() : '-'}</td>
                  )}
                  <td>
                    <button onClick={() => verAlumnos(clase._id, clase)} className="btn btn-info btn-sm" style={{marginRight: '5px'}}>
                      Ver Alumnos
                    </button>
                    {esAlumno && (
                      <button
                        onClick={() => desinscribirse(clase.inscripcionId)}
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

      {claseSeleccionada && (
        <div>
          <hr style={{margin:'30px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h2 style={{margin: 0}}>Alumnos Inscritos en: {claseSeleccionada.nombre}</h2>
            <button
              onClick={cerrarDetalles}
              className="btn btn-secondary btn-sm"
            >
              Cerrar
            </button>
          </div>

          {alumnosInscritos.length === 0 ? (
            <p>No hay alumnos inscritos en esta clase.</p>
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
