export default function ApiDocs() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">📘 Documentación de la API Cursos</h1>

      <section style={{marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderLeft: '4px solid #0066cc'}}>
        <h2>🔐 Autenticación</h2>
        <p>Para endpoints protegidos, incluir el token JWT en el header:</p>
        <pre style={{backgroundColor: '#fff', padding: '0.5rem', borderRadius: '4px'}}>
          <code>Authorization: Bearer &lt;token&gt;</code>
        </pre>
        <p><small>El token se obtiene al hacer login en <code>/api/usuarios/auth</code></small></p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>👥 Usuarios</h2>
        <ul>
          <li><strong>POST</strong> /api/usuarios — Registro</li>
          <li><strong>POST</strong> /api/usuarios/auth — Login (JWT)</li>
          <li><strong>GET</strong> /api/usuarios — Listar usuarios (JWT)</li>
          <li><strong>GET</strong> /api/usuarios/:id — Detalle (JWT)</li>
          <li><strong>PUT</strong> /api/usuarios/:id — Actualizar usuario (JWT)</li>
          <li><strong>DELETE</strong> /api/usuarios/:id — Eliminar usuario (JWT)</li>
        </ul>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>📚 Cursos</h2>
        <ul>
          <li><strong>GET</strong> /api/cursos — Listar</li>
          <li><strong>GET</strong> /api/cursos/:id — Detalle</li>
          <li><strong>POST</strong> /api/cursos — Crear (JWT)</li>
          <li><strong>PUT</strong> /api/cursos/:id — Actualizar curso (JWT)</li>
          <li><strong>DELETE</strong> /api/cursos/:id — Eliminar curso (JWT)</li>
        </ul>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>📝 Inscripciones</h2>
        <ul>
          <li><strong>GET</strong> /api/inscripciones — Listar</li>
          <li><strong>POST</strong> /api/inscripciones — Inscribirse (JWT)</li>
        </ul>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>🏥 Health Check</h2>
        <ul>
          <li><strong>GET</strong> /api/health — Estado del servidor</li>
        </ul>
      </section>

      <p style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>
        <strong>Base URL:</strong> <code>http://localhost:5000</code>
      </p>
    </div>
  );
}