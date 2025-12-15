import React, { useState, useEffect, useContext } from 'react';
import { Home, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import "./Header.css";


import { ThemeContext } from "../../context/themeContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Header = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ token: "" });

  // CONTEXTO DO TEMA
  const { theme, toggleTheme } = useContext(ThemeContext);

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
      const res = await fetch(`${API_URL}/api/auth/token-login`, {
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
      <header className="header">
        <div className="header-container">

          {/* LOGO */}
          <Link to="/" className="header-logo">
            <Home size={32} />
            <h1 className="header-title">ImóveisAluguel</h1>
          </Link>

          <nav className="header-nav">

            <Link to="/" className="header-iconButton">Início</Link>

            {authUser ? (
              <>

                <button
                  className="header-panelButton"
                  onClick={() => navigate("/dashboard")}
                >
                  Gerenciar Imóveis
                </button>
                {/* BOTÃO DE ACESSO A PAGINA ADMISTRATIVA */}
                <span className="header-userText">Olá, administrador</span>
                {/* BOTAÃO DE SAIR DO ACESSO ADMINISTRATOR */}
                <button onClick={handleLogout} className="header-iconButton">
                  <LogOut size={20} /> Sair
                </button>

              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="header-iconButton"
              >
                <LogIn size={20} /> Entrar
              </button>
            )}
                {/* BOTÃO DE TEMA */}
                <button className="header-iconButton" onClick={toggleTheme}>
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                  {theme === "light" ? "Escuro" : "Claro"}
                </button>
          </nav>

        </div>
      </header>

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="header-modalOverlay">
          <div className="header-modalBox">

            <h2 style={{ marginBottom: "1rem" }}>Autenticação</h2>

            <input
              type="text"
              name="token"
              placeholder="Digite seu token"
              className="header-modalInput"
              value={loginForm.token}
              onChange={(e) =>
                setLoginForm(prev => ({ ...prev, token: e.target.value }))
              }
            />

            <button onClick={handleLogin} className="header-modalButton">
              Entrar
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="header-modalCancel"
            >
              Cancelar
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
