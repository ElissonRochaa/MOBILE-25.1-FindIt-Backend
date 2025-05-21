# MOBILE-25.1-FindIt-Backend

API de uma rede social de achados e perdidos (FindIt) da disciplina de programação para dispositivos móveis do curso de Engenharia de software da Universidade de Pernambuco campus Garanhuns

---

## 🚀 Como Rodar o Projeto

Siga estes passos para configurar e executar o projeto em sua máquina local.

### 1️⃣ Pré-requisitos

Antes de começar, certifique-se de ter o **Node.js** (versão 18 ou superior é recomendada) e o **MongoDB** instalados em sua máquina.

* **Node.js:** Se você ainda não tem, baixe e instale a versão LTS recomendada em [nodejs.org](https://nodejs.org/).
* **MongoDB:** Para instalar o banco de dados MongoDB em seu sistema operacional, siga as instruções oficiais em [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
    * **Alternativa (MongoDB Atlas):** Se preferir usar um banco de dados na nuvem, você pode criar uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) e obter sua URI de conexão de lá.

### 2️⃣ Instalar Dependências

No terminal, na raiz do projeto, execute o comando para instalar todas as dependências do Node.js:

```bash
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente

Crie um arquivo chamado `.env` na **raiz do seu projeto**. Este arquivo armazenará informações sensíveis e configurações do ambiente.

Adicione as seguintes variáveis ao seu arquivo `.env`, substituindo os valores pelos seus:

```dotenv
PORT=8080
MONGO_URI=mongodb://localhost:27017/finditdb_local # Ou sua string de conexão do MongoDB Atlas
JWT_SECRET=sua_chave_secreta_jwt_longa_e_aleatoria_aqui
```

* **`PORT`**: A porta em que o servidor Express será executado (ex: `8080`).
* **`MONGO_URI`**: A string de conexão para o seu banco de dados MongoDB.
    * **Se estiver usando MongoDB local:** Geralmente será algo como `mongodb://localhost:27017/finditdb_local` (onde `finditdb_local` é o nome do seu banco de dados).
    * **Se estiver usando MongoDB Atlas (nuvem):** A URI será fornecida pelo Atlas e começará com `mongodb+srv://...`. Certifique-se de que o usuário e a senha no Atlas estão configurados corretamente.
* **`JWT_SECRET`**: Uma chave secreta **longa e aleatória** para assinar seus JSON Web Tokens (JWTs). **É crucial que esta chave seja forte e única**. Você pode gerar uma no seu terminal com: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"`.

### 4️⃣ Criar a Pasta de Uploads

Para que o upload de fotos funcione, crie uma pasta chamada `uploads` na **raiz do seu projeto**:

```bash
mkdir uploads
```

Essa pasta é ignorada pelo Git (verifique seu `.gitignore`), pois armazenará arquivos de mídia enviados.

### 5️⃣ Rodar o Projeto em Desenvolvimento

Com o MongoDB rodando (localmente ou na nuvem) e as variáveis de ambiente configuradas, inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor deverá iniciar e você verá mensagens no terminal sobre a conexão com o MongoDB e a porta em que está rodando.

### 6️⃣ Compilar o TypeScript e Rodar em Produção

Para compilar o código TypeScript para JavaScript (geralmente para ambientes de produção):

```bash
npm run build
# ou, se preferir:
npx tsc
```

Isso criará uma pasta `dist/` com os arquivos JavaScript compilados.

Para iniciar o servidor usando os arquivos compilados:

```bash
npm start
# ou, se preferir:
node dist/index.js
```

---
