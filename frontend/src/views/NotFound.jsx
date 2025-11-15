export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-4 fw-bold text-danger mb-3">404</h1>
      <h2 className="h4 mb-4">Página no encontrada</h2>
      <p className="text-muted mb-5">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <a href="/" className="btn btn-dark px-4 py-2">
        Volver al inicio
      </a>
    </div>
  );
}
