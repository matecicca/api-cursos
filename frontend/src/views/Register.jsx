import { useState } from 'react';
import api from '../services/api';

export default function Register(){
  const [form, setForm] = useState({ nombre:'', tipo:'alumno', email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e)=> {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!form.email || !form.password) return setErr('Email y password requeridos');
    try{
      await api.post('/usuarios', form);
      setMsg('Usuario creado. Ahora inicia sesión.');
    }catch(e){
      setErr(e?.response?.data?.msg || 'Error creando usuario');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{display:'grid', gap:8, maxWidth:420}}>
      <h2>Registro</h2>
      {err && <p style={{color:'red'}}>{err}</p>}
      {msg && <p style={{color:'green'}}>{msg}</p>}
      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={e=>setForm({...form, nombre:e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e=>setForm({...form, email:e.target.value})}
        required
      />
      <div>
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e=>setForm({...form, password:e.target.value})}
          minLength="6"
          required
          style={{width:'100%'}}
        />
        <small style={{color:'#666'}}>Mínimo 6 caracteres</small>
      </div>
      <select value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value})}>
        <option value="alumno">Alumno</option>
        <option value="docente">Docente</option>
      </select>
      <button>Crear cuenta</button>
    </form>
  );
}
