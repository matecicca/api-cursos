import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e)=> {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Email y password requeridos');
    try{
      setLoading(true);
      const { data } = await api.post('/usuarios/auth', { email, password });
      const token = data?.token;
      const user = data?.user;
      if (!token || !user) throw new Error('Respuesta sin token o usuario');
      login(user, token);
      nav('/');
    }catch(e){
      setErr(e?.response?.data?.msg || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{display:'grid', gap:8, maxWidth:380}}>
      <h2>Iniciar sesión</h2>
      {err && <p style={{color:'red'}}>{err}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        required
      />
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          minLength="6"
          required
          style={{width:'100%'}}
        />
        <small style={{color:'#666'}}>Mínimo 6 caracteres</small>
      </div>
      <button disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>
    </form>
  );
}
