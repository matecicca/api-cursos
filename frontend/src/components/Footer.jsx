export default function Footer(){
  return (
    <footer style={{borderTop:'1px solid #ddd', padding: '0.5rem 1rem', marginTop: 24, opacity: .7}}>
      © {new Date().getFullYear()} Escolar
    </footer>
  );
}
