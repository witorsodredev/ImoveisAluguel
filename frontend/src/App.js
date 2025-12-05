import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import PropertyForm from './components/PropertyForm';
import './App.css';
import Dashboard from './components/Dashboard';
import EditProperty from './components/EditProperty';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/properties`);

      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis do servidor');
      }

      const data = await response.json();
      setProperties(data);

    } catch (err) {
      console.error('Erro ao buscar imóveis:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = (newProperty) => {
    setProperties(prev => [...prev, newProperty]);
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Deseja realmente remover este imóvel? As imagens também serão deletadas.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover imóvel');
      }

      setProperties(prev => prev.filter(p => p.id !== id));
      alert('Imóvel removido com sucesso!');

    } catch (error) {
      console.error('Erro ao remover imóvel:', error);
      alert(`Erro ao remover imóvel: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Router>
        <div className="App">
          <Header />
          <main style={{ 
            minHeight: 'calc(100vh - 200px)', 
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #e5e7eb',
                borderTop: '5px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <h2 style={{ color: '#6b7280' }}>Carregando imóveis...</h2>
            </div>
          </main>
        </div>
      </Router>
    );
  }

  if (error) {
    return (
      <Router>
        <div className="App">
          <Header />
          <main style={{ 
            minHeight: 'calc(100vh - 200px)', 
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxWidth: '500px'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '1rem',
                color: '#ef4444'
              }}>⚠️</div>
              <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                Erro ao carregar dados
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {error}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Verifique se o servidor backend está rodando em {API_URL}
              </p>
              <button 
                onClick={fetchProperties}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Tentar Novamente
              </button>
            </div>
          </main>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header />
        <main style={{ minHeight: 'calc(100vh - 200px)', backgroundColor: '#f9fafb' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <PropertyList 
                  properties={properties} 
                  onDelete={handleDeleteProperty}
                />
              } 
            />
            <Route 
              path="/imovel/:id" 
              element={<PropertyDetail properties={properties} />} 
            />
            <Route 
              path="/publicar" 
              element={<PropertyForm onSubmit={handleAddProperty} />} 
            />
            <Route
              path='/dashboard'
              element={<Dashboard />} />
            <Route
              path='/edit/:id' element={<EditProperty/>} />
          </Routes>
        </main>
        <footer style={{ 
          backgroundColor: '#1f2937', 
          color: 'white', 
          textAlign: 'center', 
          padding: '2rem',
          marginTop: '3rem'
        }}>
          <p>&copy; 2025 ImóveisAluguel. Todos os direitos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
