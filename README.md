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
