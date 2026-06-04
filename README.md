# Pactum Project

**Pactum** (do latim: *Acordo, Pacto, Contrato*) é uma plataforma SaaS projetada para Gestão de Contratos e Faturamento Recorrente, idealizada especialmente para revendas de software e empresas de automação comercial.

O objetivo do projeto é oferecer um controle seguro, isolado e moderno para gerir clientes, grupos corporativos, catálogo de produtos, reajustes e o ciclo de vida completo de assinaturas/contratos de software.

## 🚀 Principais Funcionalidades

- **Multi-Tenancy Isolado:** Arquitetura *Schema-per-Tenant* no PostgreSQL para garantir vazamento zero de dados entre empresas.
- **Gestão de Identidade (IAM):** Autenticação JWT, permissões RBAC por tenant, com arquitetura preparada para MFA.
- **Catálogo de Produtos:** Precificação de softwares e submódulos versionados.
- **Ciclo de Vida de Contratos:** Rascunho, assinatura, ativação, suspensão, renovação (automática ou manual com reajustes), cancelamento e negociação de dívidas.
- **Geração de Documentos:** Templates DOCX dinâmicos preenchidos com dados reais do contrato e cliente, convertidos para PDF e armazenados em nuvem via AWS S3 / MinIO.
- **LGPD Compliance:** Foco na transparência, tracking de consentimento e trilhas de auditoria (Audit Logs) imutáveis.

---

## 🛠️ Stack Tecnológico

O projeto é dividido em um monorepo conceitual (Frontend e Backend isolados, orquestrados via Docker):

### Backend
- **Framework:** NestJS (Node.js) com TypeScript.
- **Banco de Dados:** PostgreSQL.
- **ORM:** Prisma ORM.
- **Cache & Filas:** Redis + Bull (Processamento assíncrono).
- **Armazenamento:** MinIO / AWS S3 SDK (Templates e PDFs).

### Frontend
- **Framework:** Next.js (React) com TypeScript.
- **Estilização:** Tailwind CSS + Shadcn/UI.
- **Formulários:** React Hook Form + Zod para validação.
- **State/Fetch:** TanStack Query (React Query).
- **Internacionalização:** next-intl (PT-BR, EN, ES).

### Infraestrutura & Orquestração
- **Containers:** Docker + Docker Compose.
- **Proxy/Gateway:** Traefik.
- **Utilitários Containerizados:** 
  - **Gotenberg** (Conversão de DOCX para PDF).
  - **MinIO** (Armazenamento de objetos S3).
  - **Mailpit** (Captura de emails locais para debug).

---

## 🏗️ Princípios de Arquitetura

O backend segue rigorosamente os seguintes padrões de engenharia:
1. **Domain-Driven Design (DDD):** Lógicas de negócio pertencem a camadas de domínio, não a controladores ou DTOs.
2. **Clean Architecture:** Repositórios servem como abstrações; a infraestrutura depende de contratos do domínio e não o inverso.
3. **SOLID & Segurança:** Validação rígida de inputs, segurança por padrão (Secure Defaults) seguindo as recomendações da OWASP, com logs imutáveis para qualquer ação de gravação.

---

## 💻 Como Rodar Localmente

Para rodar o projeto em seu ambiente de desenvolvimento, siga as etapas abaixo.

### Pré-requisitos
- Docker e Docker Compose instalados.
- Node.js (v18+) e NPM/Yarn.

### Passo 1: Subir a Infraestrutura Base
O arquivo `docker-compose.yml` subirá o PostgreSQL, Redis, RabbitMQ, Traefik, MinIO, Gotenberg e Mailpit.
```bash
docker-compose up -d
```

### Passo 2: Configurar o Backend
```bash
cd backend
npm install
# Crie e preencha seu arquivo .env baseando-se no .env.example
cp .env.example .env
# Rode as migrations no banco recém-criado
npx prisma migrate dev
# Inicie o servidor
npm run start:dev
```

### Passo 3: Configurar o Frontend
```bash
cd frontend
npm install
# Crie seu .env
cp .env.example .env.local
# Inicie o frontend
npm run dev
```

---

## 🤝 Repositório e Commits

Todo o histórico está mantido em [JoaoGaBRiel-X/pactum_project](https://github.com/JoaoGaBRiel-X/pactum_project). Nós utilizamos as convenções do **Commitlint** e **Husky** para garantir mensagens de commit semânticas e verificações de testes pré-commit.
