import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home(){
  const { user, logout } = useAuth();
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/health')
      .then(r => setHealth(r.data))
      .catch(e => setErr('No se pudo obtener /health'));
  }, []);

  const limpiarLocalStorage = () => {
    if (window.confirm('¿Deseas limpiar el localStorage y cerrar sesión?')) {
      localStorage.clear();
      logout();
      window.location.reload();
    }
  };

  return (
    <section>
      <h2>Inicio</h2>

      {user && (
        <div style={{padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', marginBottom: '20px'}}>
          <h3>Usuario Actual</h3>
          <p><strong>Nombre:</strong> {user.nombre}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tipo/Rol:</strong> <span style={{fontWeight:'bold', color: user.tipo === 'admin' ? 'red' : user.tipo === 'docente' ? 'blue' : 'green'}}>{user.tipo}</span></p>
          <p><strong>ID:</strong> {user.id}</p>
          <button onClick={limpiarLocalStorage} style={{marginTop: '10px', padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>
            Limpiar localStorage y Cerrar Sesión
          </button>
        </div>
      )}

      {!user && (
        <div style={{padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', marginBottom: '20px'}}>
          <p>No hay sesión activa. Por favor, inicia sesión.</p>
        </div>
      )}

      {err && <p style={{color:'red'}}>{err}</p>}
      {health ? <pre>{JSON.stringify(health, null, 2)}</pre> : <p>Cargando...</p>}
    </section>
  );
}
