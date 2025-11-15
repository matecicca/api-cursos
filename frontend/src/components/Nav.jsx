import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav(){
  const { user, token, logout } = useAuth();

  const esAdmin = user?.tipo === 'admin';
  const esDocente = user?.tipo === 'docente';
  const esAlumno = user?.tipo === 'alumno';

  return (
    <nav style={{display:'flex', gap:12, padding:'0.5rem 1rem'}}>
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/usuarios">Usuarios</NavLink>
      <NavLink to="/clases">Clases</NavLink>
      {esAdmin && <NavLink to="/admin" style={{fontWeight:'bold', color:'#c00'}}>Admin</NavLink>}
      {(esDocente || esAlumno) && <NavLink to="/mis-clases">Mis Clases</NavLink>}
      {!token ? <NavLink to="/login">Login</NavLink> : <button onClick={logout}>Salir</button>}
    </nav>
  );
}
