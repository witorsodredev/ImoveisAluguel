import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import PropertyList from "./components/PropertyList/PropertyList";
import PropertyDetail from "./components/PropertyDetail/PropertyDetail";
import PropertyForm from "./components/PropertyForm/PropertyForm";
import Dashboard from "./components/Dashboard/Dashboard";
import EditProperty from "./components/EditProperty/EditProperty";

import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
          <main
            style={{
              minHeight: "calc(100vh - 200px)",
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "5px solid var(--card-border)",
                  borderTop: "5px solid var(--button-bg)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <h2 style={{ color: "var(--text-muted)" }}>
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
          <main
            style={{
              minHeight: "calc(100vh - 200px)",
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "var(--card-bg)",
                borderRadius: "8px",
                border: "1px solid var(--card-border)",
                maxWidth: "500px",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  color: "var(--danger-bg, #ef4444)",
                  marginBottom: "1rem",
                }}
              >
                ⚠️
              </div>

              <h2 style={{ color: "var(--text)", marginBottom: "1rem" }}>
                Erro ao carregar dados
              </h2>

              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                {error}
              </p>

              <p
                style={{
                  color: "var(--text-muted-light)",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                Verifique se o servidor backend está rodando em {API_URL}
              </p>

              <button
                onClick={fetchProperties}
                style={{
                  background: "var(--button-bg)",
                  color: "var(--button-text)",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
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

        <main
          style={{
            minHeight: "calc(100vh - 200px)",
            background: "var(--bg)",
            color: "var(--text)",
          }}
        >
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

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/edit/:id" element={<EditProperty />} />
          </Routes>
        </main>

        <footer
          style={{
            background: "var(--card-bg)",
            color: "var(--text)",
            textAlign: "center",
            padding: "2rem",
            marginTop: "3rem",
            borderTop: "1px solid var(--card-border)",
          }}
        >
          <p>© 2025 ImóveisAluguel. Todos os direitos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
