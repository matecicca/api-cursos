import { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

// Función para verificar si el token JWT ha expirado
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= exp;
  } catch (error) {
    return true; // Si hay error al decodificar, considerar expirado
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    // Verificar si el token existe y no ha expirado
    if (savedToken && isTokenExpired(savedToken)) {
      // Token expirado, limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');

    // Verificar si el token no ha expirado
    if (savedToken && !isTokenExpired(savedToken)) {
      return savedToken;
    }

    // Token expirado o no existe
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  });

  // Verificar expiración del token periódicamente
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        // Token expirado, hacer logout
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenExpiration, 30000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return <AuthCtx.Provider value={{ user, token, login, logout }}>
    {children}
  </AuthCtx.Provider>;
}
