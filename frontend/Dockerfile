# Usa imagem oficial do Node (versão LTS)
FROM node:18

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia somente arquivos essenciais primeiro (cache eficiente)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta usada pela aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
