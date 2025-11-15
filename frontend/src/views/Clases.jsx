import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Clases(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const esAlumno = user?.tipo === 'alumno';

  const load = ()=>{
    setLoading(true);
    api.get('/clases')
      .then(({data})=> setItems(Array.isArray(data)? data: []))
      .catch(e=> setErr('No se pudo cargar la lista de clases'))
      .finally(()=> setLoading(false));
  };

  useEffect(load, []);

  const inscribirse = async (claseId) => {
    if (!window.confirm('¿Deseas inscribirte a esta clase?')) return;
    setErr('');
    setSuccess('');
    try {
      await api.post('/inscripciones', {
        alumno: user.id,
        clase: claseId
      });
      setSuccess('Inscripción realizada exitosamente');
    } catch (e) {
      const msg = e?.response?.data?.mensaje || 'Error al inscribirse';
      setErr(msg);
    }
  };

  return (
    <section>
      <h2>Clases</h2>
      <p><strong>Usuario:</strong> {user?.nombre} ({user?.tipo})</p>

      {loading && <p>Cargando...</p>}
      {err && <p style={{color:'red', padding:'10px', backgroundColor:'#fee'}}>{err}</p>}
      {success && <p style={{color:'green', padding:'10px', backgroundColor:'#efe'}}>{success}</p>}

      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%', marginBottom:16}}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Docente</th>
            <th>Fecha</th>
            <th>Code</th>
            {esAlumno && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c._id}>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
              <td>{typeof c.docente === 'object' ? (c.docente?.nombre || c.docente) : c.docente}</td>
              <td>{c.fecha ? new Date(c.fecha).toLocaleString() : '-'}</td>
              <td>{c.classCode}</td>
              {esAlumno && (
                <td>
                  <button onClick={() => inscribirse(c._id)}>
                    Inscribirse
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
