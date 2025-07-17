# 🚀 RPE - Rocket Performance and Engagement (Frontend)

**RPE (Rocket Performance and Engagement)** - Interface do usuário para o sistema de digitalização de avaliações de desempenho de funcionários.

## 🚀 Como rodar a aplicação

### Pré-requisitos

  - Node.js (versão 18+)
  - pnpm (gerenciador de pacotes)
  - Um **backend RPE** rodando localmente (normalmente em `http://localhost:3000`).

### 1\. Instalar dependências

Execute na raiz do projeto frontend:

```bash
pnpm install
```

### 2\. Iniciar a aplicação

```bash
# Inicia o servidor de desenvolvimento (com hot-reload)
pnpm dev
```

### 3\. Acessar a aplicação

  - Após iniciar, a aplicação estará disponível em: http://localhost:5173

## 👥 Usuários para Teste

Use as seguintes credenciais para acessar o sistema com diferentes perfis e permissões. A senha para todos os usuários é `password123`.

| Nome | Email | Senha | Roles Globais | Cargo | Senioridade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ana B. Oliveira Santos** | ana.oliveira@rocketcorp.com | password123 | colaborador | Desenvolvedora Frontend | Pleno |
| **Bruno A. Mendes Carvalho** | bruno.mendes@rocketcorp.com | password123 | colaborador, gestor | Tech Lead | Sênior |
| **Carla Regina Dias Fernandes** | carla.dias@rocketcorp.com | password123 | comite | Head of Engineering | Principal |
| **Diana Cristina Costa Lima** | diana.costa@rocketcorp.com | password123 | rh | People & Culture Manager | Sênior |
| **Felipe Augusto Silva Rodrigues** | felipe.silva@rocketcorp.com | password123 | colaborador | Desenvolvedor Backend | Júnior |
| **Eduardo José Ferreira da Silva** | eduardo.tech@rocketcorp.com | password123 | admin | DevOps Engineer | Sênior |
| **Lucas Henrique Fernandes Souza** | lucas.fernandes@rocketcorp.com | password123 | colaborador, líder | Product Manager | Sênior |
| **Marina Vitória Santos Oliveira** | marina.santos@rocketcorp.com | password123 | colaborador | Data Analyst | Pleno |
| **Rafael Augusto Costa Silva** | rafael.costa@rocketcorp.com | password123 | colaborador, gestor, líder | System Administrator | Principal |

## 🔧 Tecnologias Utilizadas

  - **React** - Biblioteca para construção de interfaces
  - **TypeScript** - Linguagem tipada para JavaScript
  - **Vite** - Ferramenta de build e desenvolvimento
  - **Tailwind CSS** - Framework de estilização CSS
  - **React Router** - Para gerenciamento de rotas
  - **Axios** - Para fazer requisições à API
  - **Recharts** - Biblioteca para criação de gráficos

## 🚨 Resolução de Problemas

### Erro: "Cannot GET /api/..." ou Erro de CORS

Este erro geralmente significa que o frontend não está conseguindo se comunicar com o backend.

1.  **Verifique se o servidor backend está rodando** na porta correta (normalmente `3000`).
2.  **Verifique a configuração de `proxy`** no arquivo `vite.config.ts`. Ela deve apontar para a porta do seu backend.

### Erro: "Module not found" ou dependências quebradas

Isso pode acontecer se a instalação de pacotes foi corrompida.

```bash
# Remove a pasta node_modules e o arquivo de lock
rm -rf node_modules pnpm-lock.yaml

# Reinstala tudo do zero
pnpm install
```
