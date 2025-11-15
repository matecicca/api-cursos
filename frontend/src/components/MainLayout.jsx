import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout(){
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />

      <style>{`
        .main-content {
          flex: 1;
          padding: var(--spacing-2xl) 0;
          background-color: var(--bg);
        }

        @media (max-width: 768px) {
          .main-content {
            padding: var(--spacing-xl) 0;
          }
        }
      `}</style>
    </>
  );
}
