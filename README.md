# 🏠 ImoveisAluguel

Aplicação destinada à **publicação e gerenciamento de imóveis**, voltada ao ramo imobiliário.  
O projeto é dividido em dois módulos principais:

- **Frontend** – Interface React para usuários.
- **Backend** – API em Node.js para gerenciamento de dados e lógica de negócio.

---

## 🚀 Executando o projeto com Docker

A aplicação utiliza Docker para simplificar o ambiente de desenvolvimento.

### 📌 1. Entre nos diretórios do projeto

Você pode executar o frontend e backend separadamente:

```bash
cd frontend

▶️ ## Executar em segundo plano (modo detached)
docker compose up --rebuild -d

Constrói novamente a imagem
Sobe a aplicação em background
Mantém o terminal livre

▶️ ## Executar em primeiro plano (logs visíveis)
docker compose up --rebuild

Constrói novamente a imagem
Exibe logs no terminal
Útil para depuração

🧩 ### Estrutura básica do projeto
.
├── backend
│   ├── data
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── uploads
├── frontend
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   ├── README.md
│   └── src
└── README.md

📦 ## Tecnologias utilizadas

React.js (Frontend)
Node.js + Express (Backend)
Docker & Docker Compose
JavaScript / JSX


💬 Contato
Criado por Witor Sodré
📧 Email: witor_sodre@yahoo.com
🌐 GitHub: https://github.com/witorsodredev