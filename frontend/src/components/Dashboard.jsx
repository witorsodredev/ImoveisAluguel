import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, PlusCircle } from 'lucide-react';
import "../styles/Dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (!saved) {
      navigate("/");
      return;
    }
    setAuthUser(JSON.parse(saved));
  }, [navigate]);

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
      <div className="loadingBox">
        <div className="loader"></div>
        <p>Carregando imóveis...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">Painel de Gerenciamento</h1>
      <p className="dashboard-subtitle">
        Olá, {authUser?.name}! Aqui você encontra todos os imóveis cadastrados.
      </p>

      <button onClick={goToNewProperty} className="addButton">
        <PlusCircle size={20} />
        Cadastrar Novo Imóvel
      </button>

      <div className="grid">
        {properties.length === 0 && (
          <p className="empty">Nenhum imóvel cadastrado ainda.</p>
        )}

        {properties.map((p) => (
          <div key={p.id} className="card">

            <img
              src={p.images?.[0] || "https://via.placeholder.com/300"}
              alt={p.title}
              className="card-image"
            />

            <h3 className="cardTitle">{p.title}</h3>
            <p className="cardInfo">{p.location}</p>
            <p className="cardPrice">R$ {p.price}</p>

            <div className="buttonRow">
              <button className="editButton" onClick={() => navigate(`/edit/${p.id}`)}>
                ✏️ Editar
              </button>

              <button className="deleteButton" onClick={() => deleteProperty(p.id)}>
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
