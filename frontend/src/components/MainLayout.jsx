import { Outlet } from 'react-router-dom';
import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';

export default function MainLayout(){
  return (
    <>
      <Header />
      <Nav />
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
