import React, { useState, useEffect } from 'react';
import { Home, LogIn, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Header = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ token: "" });

  // Carrega usuário logado
  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setAuthUser(JSON.parse(saved));
  }, []);

  const handleLogin = async () => {
    if (!loginForm.token) {
      alert("Digite o token de acesso.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/token-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginForm.token })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Token inválido");
        return;
      }

      localStorage.setItem("authUser", JSON.stringify(data));
      setAuthUser(data);
      setShowLogin(false);

      navigate("/dashboard");
    } catch (err) {
      alert("Erro ao validar token");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setAuthUser(null);
    navigate("/");
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>

          {/* LOGO */}
          <Link to="/" style={styles.logo}>
            <Home size={32} />
            <h1 style={styles.title}>ImóveisAluguel</h1>
          </Link>

          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Início</Link>

            {/* SE ESTIVER LOGADO */}
            {authUser ? (
              <>
                <span style={styles.userText}>Olá, administrador</span>

                <button onClick={handleLogout} style={styles.iconButton}>
                  <LogOut size={20} /> Sair
                </button>

                <button
                  style={styles.panelButton}
                  onClick={() => navigate("/dashboard")}
                >
                  Gerenciar Imóveis
                </button>
              </>
            ) : (
              <>
                {/* SE NÃO ESTIVER LOGADO */}
                <button
                  onClick={() => setShowLogin(true)}
                  style={styles.iconButton}
                >
                  <LogIn size={20} /> Entrar
                </button>
              </>
            )}

          </nav>

        </div>
      </header>

      {/* MODAL DE LOGIN */}
      {showLogin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>

            <h2 style={{ marginBottom: "1rem" }}>Autenticação</h2>

            <input
              type="text"
              name="token"
              placeholder="Digite seu token"
              value={loginForm.token}
              onChange={(e) =>
                setLoginForm(prev => ({ ...prev, token: e.target.value }))
              }
              style={styles.modalInput}
            />

            <button onClick={handleLogin} style={styles.modalButton}>
              Entrar
            </button>

            <button
              onClick={() => setShowLogin(false)}
              style={styles.modalCancel}
            >
              Cancelar
            </button>

          </div>
        </div>
      )}
    </>
  );
};

/* ESTILOS */
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
    textDecoration: 'none'
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer'
  },
  panelButton: {
    backgroundColor: '#1e40af',
    border: "none",
    padding: "0.5rem 1rem",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer"
  },
  userText: {
    color: '#e5e7eb'
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalBox: {
    width: "350px",
    background: "white",
    padding: "2rem",
    borderRadius: "8px",
    textAlign: "center"
  },
  modalInput: {
    width: "100%",
    padding: "0.6rem",
    margin: "0.5rem 0",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  modalButton: {
    width: "100%",
    padding: "0.8rem",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "6px",
    border: "none",
    marginTop: "0.5rem",
    cursor: "pointer"
  },
  modalCancel: {
    width: "100%",
    padding: "0.7rem",
    background: "#ddd",
    borderRadius: "6px",
    border: "none",
    marginTop: "0.5rem",
    cursor: "pointer"
  }
};

export default Header;
