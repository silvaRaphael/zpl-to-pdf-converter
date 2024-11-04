FROM node:20

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie package.json e package-lock.json e instale as dependências
COPY package*.json ./
RUN npm install

# Copie o restante dos arquivos do projeto para o contêiner
COPY . .

# Compile o projeto TypeScript
RUN npm run build

# Exponha a porta em que o servidor vai rodar (ajuste conforme necessário)
EXPOSE 3000

# Comando para rodar a aplicação (ajuste conforme seu servidor)
CMD ["node", "src/server.js"]
