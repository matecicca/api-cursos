import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', email: '', password: '', tipo: 'alumno'
  });
  const [formCurso, setFormCurso] = useState({
    nombre: '', descripcion: '', docente: '', fecha: '', classCode: ''
  });
  const [formInscripcion, setFormInscripcion] = useState({
    alumno: '', curso: ''
  });

  const [editingCurso, setEditingCurso] = useState(null);
  const [editFormCurso, setEditFormCurso] = useState({
    nombre: '', descripcion: '', docente: '', fecha: '', classCode: ''
  });

  const [editingUsuario, setEditingUsuario] = useState(null);
  const [editFormUsuario, setEditFormUsuario] = useState({
    nombre: '', email: '', tipo: 'alumno', password: ''
  });

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      navigate('/');
      return;
    }
    cargarDatos();
  }, [user, navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosRes, cursosRes, inscripcionesRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/cursos'),
        api.get('/inscripciones')
      ]);

      setUsuarios(usuariosRes.data);
      setCursos(cursosRes.data);
      setInscripciones(inscripcionesRes.data);
      setLoading(false);
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al cargar datos');
      setLoading(false);
    }
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', formUsuario);
      showSuccess('Usuario creado exitosamente');
      setFormUsuario({ nombre: '', email: '', password: '', tipo: 'alumno' });
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.msg || err.response?.data?.mensaje || 'Error al crear usuario');
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      showSuccess('Usuario eliminado exitosamente');
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al eliminar usuario');
    }
  };

  const startEditUsuario = (usuario) => {
    setEditingUsuario(usuario._id);
    setEditFormUsuario({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      tipo: usuario.tipo || 'alumno',
      password: ''
    });
  };

  const cancelEditUsuario = () => {
    setEditingUsuario(null);
    setEditFormUsuario({ nombre: '', email: '', tipo: 'alumno', password: '' });
  };

  const actualizarUsuario = async (e, id) => {
    e.preventDefault();
    try {
      const payload = { ...editFormUsuario };
      if (!payload.password) {
        delete payload.password;
      }
      await api.put(`/usuarios/${id}`, payload);
      showSuccess('Usuario actualizado exitosamente');
      cancelEditUsuario();
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al actualizar usuario');
    }
  };

  // Función para contar alumnos inscriptos por curso
  const contarAlumnosPorCurso = (cursoId) => {
    return inscripciones.filter(i => i.curso?._id === cursoId || i.curso === cursoId).length;
  };

  const crearCurso = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formCurso,
        classCode: Number(formCurso.classCode),
        fecha: formCurso.fecha ? new Date(formCurso.fecha).toISOString() : ''
      };
      await api.post('/cursos', payload);
      showSuccess('Curso creado exitosamente');
      setFormCurso({ nombre: '', descripcion: '', docente: '', fecha: '', classCode: '' });
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || err.response?.data?.errors?.[0]?.msg || 'Error al crear curso');
    }
  };

  const startEdit = (curso) => {
    setEditingCurso(curso._id);
    setEditFormCurso({
      nombre: curso.nombre || '',
      descripcion: curso.descripcion || '',
      docente: typeof curso.docente === 'object' ? curso.docente?._id || '' : curso.docente || '',
      fecha: curso.fecha ? new Date(curso.fecha).toISOString().slice(0, 16) : '',
      classCode: curso.classCode || ''
    });
  };

  const cancelEdit = () => {
    setEditingCurso(null);
    setEditFormCurso({ nombre: '', descripcion: '', docente: '', fecha: '', classCode: '' });
  };

  const actualizarCurso = async (e, id) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormCurso,
        classCode: Number(editFormCurso.classCode),
        fecha: editFormCurso.fecha ? new Date(editFormCurso.fecha).toISOString() : ''
      };
      await api.put(`/cursos/${id}`, payload);
      showSuccess('Curso actualizado exitosamente');
      cancelEdit();
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al actualizar curso');
    }
  };

  const eliminarCurso = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    try {
      await api.delete(`/cursos/${id}`);
      showSuccess('Curso eliminado exitosamente');
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al eliminar curso');
    }
  };

  const crearInscripcion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inscripciones', formInscripcion);
      showSuccess('Inscripción creada exitosamente');
      setFormInscripcion({ alumno: '', curso: '' });
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al crear inscripción');
    }
  };

  const eliminarInscripcion = async (id) => {
    if (!window.confirm('¿Eliminar esta inscripción?')) return;
    try {
      await api.delete(`/inscripciones/${id}`);
      showSuccess('Inscripción eliminada exitosamente');
      cargarDatos();
    } catch (err) {
      showError(err.response?.data?.mensaje || 'Error al eliminar inscripción');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h1>Panel de Administración</h1>

      {/* Sección de Usuarios */}
      <hr style={{margin:'30px 0'}} />
      <h2>Gestión de Usuarios</h2>

      <h3>Crear Usuario</h3>
      <form onSubmit={crearUsuario} style={{display:'grid', gap:8, maxWidth:480, marginBottom:20}}>
        <input
          className="form-control"
          placeholder="Nombre"
          value={formUsuario.nombre}
          onChange={e=>setFormUsuario({...formUsuario, nombre:e.target.value})}
          required
        />
        <input
          className="form-control"
          type="email"
          placeholder="Email"
          value={formUsuario.email}
          onChange={e=>setFormUsuario({...formUsuario, email:e.target.value})}
          required
        />
        <input
          className="form-control"
          type="password"
          placeholder="Contraseña"
          value={formUsuario.password}
          onChange={e=>setFormUsuario({...formUsuario, password:e.target.value})}
          required
          minLength="6"
        />
        <select
          className="form-select"
          value={formUsuario.tipo}
          onChange={e=>setFormUsuario({...formUsuario, tipo:e.target.value})}
        >
          <option value="alumno">Alumno</option>
          <option value="docente">Docente</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-primary">Crear Usuario</button>
      </form>

      <h3>Listado de Usuarios</h3>
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%', marginBottom:30}}>
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Tipo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            editingUsuario === u._id ? (
              <tr key={u._id}>
                <td colSpan="4">
                  <form onSubmit={(e) => actualizarUsuario(e, u._id)} style={{display:'grid', gap:8, padding:10}}>
                    <input
                      className="form-control"
                      placeholder="Nombre"
                      value={editFormUsuario.nombre}
                      onChange={e=>setEditFormUsuario({...editFormUsuario, nombre:e.target.value})}
                      required
                    />
                    <input
                      className="form-control"
                      type="email"
                      placeholder="Email"
                      value={editFormUsuario.email}
                      onChange={e=>setEditFormUsuario({...editFormUsuario, email:e.target.value})}
                      required
                    />
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                      value={editFormUsuario.password}
                      onChange={e=>setEditFormUsuario({...editFormUsuario, password:e.target.value})}
                    />
                    <select
                      className="form-select"
                      value={editFormUsuario.tipo}
                      onChange={e=>setEditFormUsuario({...editFormUsuario, tipo:e.target.value})}
                    >
                      <option value="alumno">Alumno</option>
                      <option value="docente">Docente</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div style={{display:'flex', gap:8}}>
                      <button type="submit" className="btn btn-success btn-sm">Guardar</button>
                      <button type="button" onClick={cancelEditUsuario} className="btn btn-secondary btn-sm">Cancelar</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={u._id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.tipo}</td>
                <td>
                  <button onClick={() => startEditUsuario(u)} className="btn btn-warning btn-sm" style={{marginRight:4}}>Editar</button>
                  <button onClick={() => eliminarUsuario(u._id)} className="btn btn-danger btn-sm">Eliminar</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Sección de Cursos */}
      <hr style={{margin:'30px 0'}} />
      <h2>Gestión de Cursos</h2>

      <h3>Crear Curso</h3>
      <form onSubmit={crearCurso} style={{display:'grid', gap:8, maxWidth:480, marginBottom:20}}>
        <input
          className="form-control"
          placeholder="Nombre"
          value={formCurso.nombre}
          onChange={e=>setFormCurso({...formCurso, nombre:e.target.value})}
          required
        />
        <input
          className="form-control"
          placeholder="Descripción"
          value={formCurso.descripcion}
          onChange={e=>setFormCurso({...formCurso, descripcion:e.target.value})}
        />
        <input
          className="form-control"
          placeholder="Docente (ID/email)"
          value={formCurso.docente}
          onChange={e=>setFormCurso({...formCurso, docente:e.target.value})}
          required
        />
        <input
          className="form-control"
          type="datetime-local"
          value={formCurso.fecha}
          onChange={e=>setFormCurso({...formCurso, fecha:e.target.value})}
        />
        <input
          className="form-control"
          type="number"
          placeholder="Class Code (1-15)"
          value={formCurso.classCode}
          onChange={e=>setFormCurso({...formCurso, classCode:e.target.value})}
          min="1"
          max="15"
          required
        />
        <button className="btn btn-primary">Crear Curso</button>
      </form>

      <h3>Listado de Cursos</h3>
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%', marginBottom:30}}>
        <thead>
          <tr><th>Nombre</th><th>Descripción</th><th>Docente</th><th>Code</th><th>Inscriptos</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {cursos.map(c => (
            editingCurso === c._id ? (
              <tr key={c._id}>
                <td colSpan="6">
                  <form onSubmit={(e) => actualizarCurso(e, c._id)} style={{display:'grid', gap:8, padding:10}}>
                    <input
                      className="form-control"
                      placeholder="Nombre"
                      value={editFormCurso.nombre}
                      onChange={e=>setEditFormCurso({...editFormCurso, nombre:e.target.value})}
                      required
                    />
                    <input
                      className="form-control"
                      placeholder="Descripción"
                      value={editFormCurso.descripcion}
                      onChange={e=>setEditFormCurso({...editFormCurso, descripcion:e.target.value})}
                    />
                    <input
                      className="form-control"
                      placeholder="Docente (ID/email)"
                      value={editFormCurso.docente}
                      onChange={e=>setEditFormCurso({...editFormCurso, docente:e.target.value})}
                    />
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={editFormCurso.fecha}
                      onChange={e=>setEditFormCurso({...editFormCurso, fecha:e.target.value})}
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Class Code"
                      value={editFormCurso.classCode}
                      onChange={e=>setEditFormCurso({...editFormCurso, classCode:e.target.value})}
                      min="1"
                      max="15"
                      required
                    />
                    <div style={{display:'flex', gap:8}}>
                      <button type="submit" className="btn btn-success btn-sm">Guardar</button>
                      <button type="button" onClick={cancelEdit} className="btn btn-secondary btn-sm">Cancelar</button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={c._id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion}</td>
                <td>{typeof c.docente === 'object' ? c.docente?.nombre : c.docente}</td>
                <td>{c.classCode}</td>
                <td style={{textAlign:'center'}}>
                  <span className="badge-inscriptos">{contarAlumnosPorCurso(c._id)}</span>
                </td>
                <td>
                  <button onClick={() => startEdit(c)} className="btn btn-warning btn-sm" style={{marginRight:4}}>Editar</button>
                  <button onClick={() => eliminarCurso(c._id)} className="btn btn-danger btn-sm">Eliminar</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Sección de Inscripciones */}
      <hr style={{margin:'30px 0'}} />
      <h2>Gestión de Inscripciones</h2>

      <h3>Crear Inscripción</h3>
      <form onSubmit={crearInscripcion} style={{display:'grid', gap:8, maxWidth:480, marginBottom:20}}>
        <input
          className="form-control"
          placeholder="Alumno (ID/email/nombre)"
          value={formInscripcion.alumno}
          onChange={e=>setFormInscripcion({...formInscripcion, alumno:e.target.value})}
          required
        />
        <input
          className="form-control"
          placeholder="Curso (ID/classCode/nombre)"
          value={formInscripcion.curso}
          onChange={e=>setFormInscripcion({...formInscripcion, curso:e.target.value})}
          required
        />
        <button className="btn btn-primary">Crear Inscripción</button>
      </form>

      <h3>Listado de Inscripciones</h3>
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%'}}>
        <thead>
          <tr><th>Alumno</th><th>Curso</th><th>Fecha</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {inscripciones.map(i => (
            <tr key={i._id}>
              <td>{i.alumno?.nombre || 'N/A'}</td>
              <td>{i.curso?.nombre || 'N/A'}</td>
              <td>{i.fecha ? new Date(i.fecha).toLocaleDateString() : '-'}</td>
              <td>
                <button onClick={() => eliminarInscripcion(i._id)} className="btn btn-danger btn-sm">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

        .form-control,
        .form-select {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-sm);
          line-height: 1.5;
          color: var(--text);
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-control:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-control::placeholder {
          color: var(--muted);
        }

        .form-control:disabled,
        .form-select:disabled {
          background-color: var(--bg);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .badge-inscriptos {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          background-color: var(--primary);
          color: white;
          border-radius: 50%;
          font-size: var(--text-sm);
          font-weight: 600;
        }
      `}</style>
    </section>
  );
}
