import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [clases, setClases] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formularios
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', email: '', password: '', tipo: 'alumno'
  });
  const [formClase, setFormClase] = useState({
    nombre: '', descripcion: '', docente: '', fecha: '', classCode: ''
  });
  const [formInscripcion, setFormInscripcion] = useState({
    alumno: '', clase: ''
  });

  const [editingClase, setEditingClase] = useState(null);
  const [editFormClase, setEditFormClase] = useState({
    nombre: '', descripcion: '', docente: '', fecha: '', classCode: ''
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
      const [usuariosRes, clasesRes, inscripcionesRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/clases'),
        api.get('/inscripciones')
      ]);

      setUsuarios(usuariosRes.data);
      setClases(clasesRes.data);
      setInscripciones(inscripcionesRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar datos');
      setLoading(false);
    }
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/usuarios', formUsuario);
      setSuccess('Usuario creado exitosamente');
      setFormUsuario({ nombre: '', email: '', password: '', tipo: 'alumno' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.mensaje || 'Error al crear usuario');
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/usuarios/${id}`);
      setSuccess('Usuario eliminado exitosamente');
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al eliminar usuario');
    }
  };

  const crearClase = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formClase,
        classCode: Number(formClase.classCode),
        fecha: formClase.fecha ? new Date(formClase.fecha).toISOString() : ''
      };
      await api.post('/clases', payload);
      setSuccess('Clase creada exitosamente');
      setFormClase({ nombre: '', descripcion: '', docente: '', fecha: '', classCode: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.errors?.[0]?.msg || 'Error al crear clase');
    }
  };

  const startEdit = (clase) => {
    setEditingClase(clase._id);
    setEditFormClase({
      nombre: clase.nombre || '',
      descripcion: clase.descripcion || '',
      docente: typeof clase.docente === 'object' ? clase.docente?._id || '' : clase.docente || '',
      fecha: clase.fecha ? new Date(clase.fecha).toISOString().slice(0, 16) : '',
      classCode: clase.classCode || ''
    });
  };

  const cancelEdit = () => {
    setEditingClase(null);
    setEditFormClase({ nombre: '', descripcion: '', docente: '', fecha: '', classCode: '' });
  };

  const actualizarClase = async (e, id) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...editFormClase,
        classCode: Number(editFormClase.classCode),
        fecha: editFormClase.fecha ? new Date(editFormClase.fecha).toISOString() : ''
      };
      await api.put(`/clases/${id}`, payload);
      setSuccess('Clase actualizada exitosamente');
      cancelEdit();
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar clase');
    }
  };

  const eliminarClase = async (id) => {
    if (!window.confirm('¿Eliminar esta clase?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/clases/${id}`);
      setSuccess('Clase eliminada exitosamente');
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al eliminar clase');
    }
  };

  const crearInscripcion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inscripciones', formInscripcion);
      setSuccess('Inscripción creada exitosamente');
      setFormInscripcion({ alumno: '', clase: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear inscripción');
    }
  };

  const eliminarInscripcion = async (id) => {
    if (!window.confirm('¿Eliminar esta inscripción?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/inscripciones/${id}`);
      setSuccess('Inscripción eliminada exitosamente');
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al eliminar inscripción');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h1>Panel de Administración</h1>
      {error && <p style={{color:'red', padding:'10px', backgroundColor:'#fee'}}>{error}</p>}
      {success && <p style={{color:'green', padding:'10px', backgroundColor:'#efe'}}>{success}</p>}

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
            <tr key={u._id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.tipo}</td>
              <td>
                <button onClick={() => eliminarUsuario(u._id)} className="btn btn-danger btn-sm">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sección de Clases */}
      <hr style={{margin:'30px 0'}} />
      <h2>Gestión de Clases</h2>

      <h3>Crear Clase</h3>
      <form onSubmit={crearClase} style={{display:'grid', gap:8, maxWidth:480, marginBottom:20}}>
        <input
          className="form-control"
          placeholder="Nombre"
          value={formClase.nombre}
          onChange={e=>setFormClase({...formClase, nombre:e.target.value})}
          required
        />
        <input
          className="form-control"
          placeholder="Descripción"
          value={formClase.descripcion}
          onChange={e=>setFormClase({...formClase, descripcion:e.target.value})}
        />
        <input
          className="form-control"
          placeholder="Docente (ID/email)"
          value={formClase.docente}
          onChange={e=>setFormClase({...formClase, docente:e.target.value})}
          required
        />
        <input
          className="form-control"
          type="datetime-local"
          value={formClase.fecha}
          onChange={e=>setFormClase({...formClase, fecha:e.target.value})}
        />
        <input
          className="form-control"
          type="number"
          placeholder="Class Code (1-15)"
          value={formClase.classCode}
          onChange={e=>setFormClase({...formClase, classCode:e.target.value})}
          min="1"
          max="15"
          required
        />
        <button className="btn btn-primary">Crear Clase</button>
      </form>

      <h3>Listado de Clases</h3>
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%', marginBottom:30}}>
        <thead>
          <tr><th>Nombre</th><th>Descripción</th><th>Docente</th><th>Code</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {clases.map(c => (
            editingClase === c._id ? (
              <tr key={c._id}>
                <td colSpan="5">
                  <form onSubmit={(e) => actualizarClase(e, c._id)} style={{display:'grid', gap:8, padding:10}}>
                    <input
                      className="form-control"
                      placeholder="Nombre"
                      value={editFormClase.nombre}
                      onChange={e=>setEditFormClase({...editFormClase, nombre:e.target.value})}
                      required
                    />
                    <input
                      className="form-control"
                      placeholder="Descripción"
                      value={editFormClase.descripcion}
                      onChange={e=>setEditFormClase({...editFormClase, descripcion:e.target.value})}
                    />
                    <input
                      className="form-control"
                      placeholder="Docente (ID/email)"
                      value={editFormClase.docente}
                      onChange={e=>setEditFormClase({...editFormClase, docente:e.target.value})}
                    />
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={editFormClase.fecha}
                      onChange={e=>setEditFormClase({...editFormClase, fecha:e.target.value})}
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Class Code"
                      value={editFormClase.classCode}
                      onChange={e=>setEditFormClase({...editFormClase, classCode:e.target.value})}
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
                <td>
                  <button onClick={() => startEdit(c)} className="btn btn-warning btn-sm" style={{marginRight:4}}>Editar</button>
                  <button onClick={() => eliminarClase(c._id)} className="btn btn-danger btn-sm">Eliminar</button>
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
          placeholder="Clase (ID/classCode/nombre)"
          value={formInscripcion.clase}
          onChange={e=>setFormInscripcion({...formInscripcion, clase:e.target.value})}
          required
        />
        <button className="btn btn-primary">Crear Inscripción</button>
      </form>

      <h3>Listado de Inscripciones</h3>
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%'}}>
        <thead>
          <tr><th>Alumno</th><th>Clase</th><th>Fecha</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {inscripciones.map(i => (
            <tr key={i._id}>
              <td>{i.alumno?.nombre || 'N/A'}</td>
              <td>{i.clase?.nombre || 'N/A'}</td>
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
      `}</style>
    </section>
  );
}
