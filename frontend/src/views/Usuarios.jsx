import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Usuarios(){
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let active = true;
    setLoading(true);
    api.get('/usuarios')
      .then(({data})=> { if(active) setItems(data || []); })
      .catch(e => setErr(e?.response?.data?.msg || 'No se pudieron cargar los usuarios'))
      .finally(()=> setLoading(false));
    return ()=>{ active=false; }
  },[]);

  return (
    <section>
      <h2>Usuarios</h2>
      {loading && <p>Cargando...</p>}
      {err && <p style={{color:'red'}}>{err}</p>}
      {!loading && !items.length && <p>No hay usuarios</p>}
      <table border="1" cellPadding="6" style={{borderCollapse:'collapse', width:'100%'}}>
        <thead>
          <tr><th>Nombre</th><th>Email</th><th>Tipo</th></tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr key={u._id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
