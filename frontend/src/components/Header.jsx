import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, token, logout } = useAuth();

  const esAdmin = user?.tipo === 'admin';
  const esDocente = user?.tipo === 'docente';
  const esAlumno = user?.tipo === 'alumno';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header-sticky">
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/" onClick={closeMenu}>
            <span className="brand-text">App Cursos</span>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  to="/"
                  onClick={closeMenu}
                >
                  Inicio
                </NavLink>
              </li>

              {token && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      to="/usuarios"
                      onClick={closeMenu}
                    >
                      Usuarios
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      to="/clases"
                      onClick={closeMenu}
                    >
                      Clases
                    </NavLink>
                  </li>

                  {esAdmin && (
                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) => `nav-link nav-link-admin ${isActive ? 'active' : ''}`}
                        to="/admin"
                        onClick={closeMenu}
                      >
                        Admin
                      </NavLink>
                    </li>
                  )}

                  {(esDocente || esAlumno) && (
                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        to="/mis-clases"
                        onClick={closeMenu}
                      >
                        Mis Clases
                      </NavLink>
                    </li>
                  )}

                  <li className="nav-item">
                    <button
                      className="btn btn-tertiary nav-logout"
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                    >
                      Salir
                    </button>
                  </li>
                </>
              )}

              {!token && (
                <li className="nav-item">
                  <NavLink
                    className="btn btn-primary"
                    to="/login"
                    onClick={closeMenu}
                  >
                    Login
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <style>{`
        .header-sticky {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: white;
          box-shadow: var(--shadow);
          border-bottom: 1px solid var(--border);
        }

        .navbar {
          padding: var(--spacing-lg) 0;
        }

        .navbar-brand {
          font-weight: 600;
          font-size: var(--text-xl);
          color: var(--title);
          text-decoration: none;
        }

        .navbar-brand:hover {
          color: var(--primary);
          text-decoration: none;
        }

        .brand-text {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-nav {
          gap: var(--spacing-md);
          align-items: center;
        }

        .nav-link {
          color: var(--text);
          font-weight: 500;
          font-size: var(--text-base);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nav-link:hover {
          color: var(--primary);
          background-color: rgba(59, 130, 246, 0.1);
          text-decoration: none;
        }

        .nav-link.active {
          color: var(--primary);
          font-weight: 600;
        }

        .nav-link-admin {
          color: var(--error);
        }

        .nav-link-admin:hover {
          color: var(--error);
          background-color: rgba(239, 68, 68, 0.1);
        }

        .nav-logout {
          margin-left: var(--spacing-sm);
        }

        .navbar-toggler {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-sm) var(--spacing-md);
        }

        .navbar-toggler:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
          outline: none;
        }

        @media (max-width: 991px) {
          .navbar-collapse {
            margin-top: var(--spacing-lg);
            padding-top: var(--spacing-lg);
            border-top: 1px solid var(--border);
          }

          .navbar-nav {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .nav-item {
            width: 100%;
          }

          .nav-link {
            width: 100%;
            padding: var(--spacing-md) var(--spacing-lg);
          }

          .nav-logout {
            width: 100%;
            margin-left: 0;
            margin-top: var(--spacing-sm);
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
