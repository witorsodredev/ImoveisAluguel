import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import PropertyList from "./components/PropertyList/PropertyList";
import PropertyDetail from "./components/PropertyDetail/PropertyDetail";
import PropertyForm from "./components/PropertyForm/PropertyForm";
import Dashboard from "./components/Dashboard/Dashboard";
import EditProperty from "./components/EditProperty/EditProperty";
import ProtectedRoute from "./components/routesafe/ProtectedRoute";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CARREGAMENTO DA PROPRIEDADE DA PAGINA
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/properties`);
      if (!response.ok) throw new Error("Erro ao carregar imóveis do servidor");

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = (newProperty) => {
    setProperties((prev) => [...prev, newProperty]);
  };


  const handleDeleteProperty = async (id) => {
    if (
      !window.confirm(
        "Deseja realmente remover este imóvel? As imagens também serão deletadas."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao remover imóvel");
      }

      setProperties((prev) => prev.filter((p) => p.id !== id));

      alert("Imóvel removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover imóvel:", error);
      alert(`Erro ao remover imóvel: ${error.message}`);
    }
  };

  /* ==========================
     TELA DE LOADING (TEMÁVEL)
     ========================== */
  if (loading) {
    return (
      <Router>
        <div className="App">
          <Header />
          <main className="loading">
            <div className="loading-container">
              <div className="loading-animation" />
              <h2>
                Carregando imóveis...
              </h2>
            </div>
          </main>
        </div>
      </Router>
    );
  }

  /* ==========================
     TELA DE ERRO (TEMÁVEL)
     ========================== */
  if (error) {
    return (
      <Router>
        <div className="App">
          <Header />
          <main className="main-app-erro">
            <div className="erro-container">

              <div className="erro-emoji">
                ⚠️
              </div>
              <h2>
                Erro ao carregar dados
              </h2>
              <p>{error}</p>
              <p>
                Verifique se o servidor backend está rodando em {API_URL}
              </p>
              <button className="erro-button-reload"
                onClick={fetchProperties}>
                Tentar Novamente
              </button>
            </div>
          </main>
        </div>
      </Router>
    );
  }

  /* ==========================
     APLICAÇÃO PRINCIPAL
     ========================== */
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-app">
          <Routes>
            <Route path="/" element={<PropertyList properties={properties} onDelete={handleDeleteProperty} />} />
            <Route path="/imovel/:id" element={<PropertyDetail properties={properties} />} />
            {/* ROTAS PROTEGIDAS  */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/publicar" element={<PropertyForm onSubmit={handleAddProperty} />} />
              <Route path="/edit/:id" element={<EditProperty />} />
            </Route>
          </Routes>
        </main>
        <footer className="footer-app">
          <p>© 2025 ImóveisAluguel. Todos os direitos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
