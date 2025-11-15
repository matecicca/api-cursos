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
              <td><button onClick={()=>del(i._id)} className="btn btn-danger btn-sm">Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Nueva inscripción</h3>
      <form onSubmit={create} style={{display:'grid', gap:8, maxWidth:480}}>
        <input className="form-control" placeholder="ID/email/nombre del alumno" value={form.alumno} onChange={e=>setForm({...form, alumno:e.target.value})}/>
        <input className="form-control" placeholder="ID/classCode/nombre de clase" value={form.clase} onChange={e=>setForm({...form, clase:e.target.value})}/>
        <button className="btn btn-primary">Inscribir</button>
      </form>

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

        .btn-danger {
          background-color: var(--error);
          color: white;
        }

        .btn-danger:hover {
          background-color: #dc2626;
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

        .form-control {
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

        .form-control:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-control::placeholder {
          color: var(--muted);
        }

        .form-control:disabled {
          background-color: var(--bg);
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </section>
  );
}
