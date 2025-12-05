import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, PlusCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proteção de rota
  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (!saved) {
      navigate("/");
      return;
    }
    setAuthUser(JSON.parse(saved));
  }, [navigate]);

  // Carrega imóveis
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${API_URL}/api/properties`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
    }
    setLoading(false);
  };

  const deleteProperty = async (id) => {
    if (!window.confirm("Deseja realmente remover este imóvel?")) return;

    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        alert("Erro ao remover imóvel");
        return;
      }

      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar imóvel");
    }
  };

  const goToNewProperty = () => {
    navigate("/publicar");
  };

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <div style={styles.loader}></div>
        <p>Carregando imóveis...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Painel de Gerenciamento</h1>

      <p style={styles.subtitle}>
        Olá, {authUser?.name}! Aqui você encontra todos os imóveis cadastrados.
      </p>

      <button onClick={goToNewProperty} style={styles.addButton}>
        <PlusCircle size={20} />
        Cadastrar Novo Imóvel
      </button>

      <div style={styles.grid}>
        {properties.length === 0 && (
          <p style={styles.empty}>Nenhum imóvel cadastrado ainda.</p>
        )}

        {properties.map((p) => (
          <div key={p.id} style={styles.card}>
            <img
              src={p.images?.[0] || "https://via.placeholder.com/300"}
              alt={p.title}
              style={styles.image}
            />

            <h3 style={styles.cardTitle}>{p.title}</h3>
            <p style={styles.cardInfo}>{p.location}</p>
            <p style={styles.cardPrice}>R$ {p.price}</p>

            <div style={styles.buttonRow}>
              <button
                onClick={() => navigate(`/edit/${p.id}`)}
                style={styles.editButton}
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => deleteProperty(p.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} /> Remover
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

/* =======================
        ESTILOS
======================= */

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "2rem auto",
    padding: "0 1rem"
  },
  title: {
    fontSize: "2rem",
    marginBottom: "0.3rem"
  },
  subtitle: {
    color: "#555",
    marginBottom: "2rem"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.5rem"
  },
  empty: {
    fontSize: "1.2rem",
    color: "#777"
  },
  card: {
    background: "white",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "6px"
  },
  cardTitle: {
    margin: "0.5rem 0",
    fontSize: "1.1rem",
    fontWeight: "600",
    textAlign: "center"
  },
  cardInfo: {
    color: "#666",
    fontSize: "0.9rem"
  },
  cardPrice: {
    fontWeight: "bold",
    margin: "0.5rem 0"
  },

  buttonRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
    width: "100%",
    justifyContent: "center"
  },

  editButton: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer"
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem"
  },

  addButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "0.7rem 1.3rem",
    borderRadius: "8px",
    display: "flex",
    alignItems:"center",
    gap: "0.4rem",
    marginBottom: "2rem",
    cursor: "pointer"
  },

  loadingBox: {
    marginTop: "5rem",
    textAlign: "center"
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "5px solid #ddd",
    borderTop: "5px solid #2563eb",
    borderRadius: "50%",
    margin: "auto",
    animation: "spin 1s linear infinite"
  }
};
