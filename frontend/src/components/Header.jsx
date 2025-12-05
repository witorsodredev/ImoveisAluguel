import React from 'react';
import { Home, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <Home size={32} />
          <h1 style={styles.title}>ImóveisAluguel</h1>
        </Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Início</Link>
          <Link to="/publicar" style={styles.navButton}>
            <PlusCircle size={20} />
            Publicar Imóvel
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem'
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  navButton: {
    backgroundColor: '#1e40af',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};

export default Header;
