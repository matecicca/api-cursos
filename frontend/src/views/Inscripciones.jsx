import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Inscripciones(){
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ alumno:'', clase:'' });

  const load = ()=>{
    setLoading(true);
    api.get('/inscripciones')
      .then(({data})=> setItems(Array.isArray(data)? data: []))
      .catch(e=> setErr('No se pudo cargar la lista de inscripciones'))
      .finally(()=> setLoading(false));
  };

  useEffect(load, []);

  const create = async (e)=>{
    e.preventDefault();
    setErr('');
    try{
      const { data } = await api.post('/inscripciones', form);
      setItems(prev => [data, ...prev]);
      setForm({ alumno:'', clase:'' });
    }catch(e){
      const msg = e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.mensaje || 'Error al crear la inscripción';
      setErr(msg);
    }
  };

  const del = async (id)=>{
    try{
      await api.delete(`/inscripciones/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    }catch(e){
      setErr(e?.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  return (
    <section>
      <h2>Inscripciones</h2>
      {loading && <p>Cargando...</p>}
      {err && <p style={{color:'red'}}>{err}</p>}

      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%', marginBottom:16}}>
        <thead>
          <tr><th>Alumno</th><th>Clase</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i._id}>
              <td>{typeof i.alumno === 'object' ? (i.alumno?.nombre || i.alumno?.email) : i.alumno}</td>
              <td>
                {typeof i.clase === 'object'
                  ? `${i.clase?.nombre || ''} (${i.clase?.classCode ?? '-'})`
                  : i.clase}
              </td>
              <td><button onClick={()=>del(i._id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Nueva inscripción</h3>
      <form onSubmit={create} style={{display:'grid', gap:8, maxWidth:480}}>
        <input placeholder="ID/email/nombre del alumno" value={form.alumno} onChange={e=>setForm({...form, alumno:e.target.value})}/>
        <input placeholder="ID/classCode/nombre de clase" value={form.clase} onChange={e=>setForm({...form, clase:e.target.value})}/>
        <button>Inscribir</button>
      </form>
    </section>
  );
}
