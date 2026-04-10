# 💈 Gu Cortes

### A sofisticação do corte tradicional aliada à precisão da engenharia de software.

[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

O **Gu Cortes** não é apenas uma interface de agendamento. É uma solução de infraestrutura pensada para resolver a fricção entre cliente e profissional. Desenvolvido com **Next.js 15**, o sistema utiliza camadas de persistência atômica para garantir que cada minuto da agenda seja respeitado, sincronizando tudo em tempo real com o ecossistema Google.

### 🎯 O Desafio & Visão do Produto
Garantir total integridade na agenda comercial de um profissional, oferecendo aos clientes finais (frequentemente navegando via 4G/Celular) uma conversão super-rápida, com interações modernas e sem nenhum atrito. O administrador, por sua vez, precisava que as entradas orbitassem entorno da ferramenta que ele já domina e monitora: o **Google Agenda**.

### 💡 Arquitetura e Engenharia Aplicada
Para blindar o sistema, este ecossistema se baseia em uma camada dupla de confiança:
1. **Segurança Transacional via PostgreSQL (Supabase):** Implementação de Restrições de Exclusividade Cruzada (_overlap constraints_) operando no nível fundamental do banco de dados (recorrendo a `tsrange` e índices multivariáveis `GiST`). Esse bloqueio imperativo torna a criação das vagas **absolutamente atômica**.
2. **Gateway com Google APIs:** Backend em Next.js (Edge Functions) operando sob credenciais protegidas de uma _Service Account_ da Google Cloud, atuando em harmonia com as transações SQL para pintar agendamentos bidirecionalmente no Google Calendar nativo do profissional.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)
![Google Calendar](https://img.shields.io/badge/Google_Calendar-API-4285F4?style=for-the-badge&logo=google-calendar)

## ✨ Principais Funcionalidades

- **Prevenção Realística de Agendamento Duplo**: Criação nativa de regras de banco (_overlap constraints_ exclusivas) direto no PostgreSQL para mitigar colisões de segundos ou falhas de Race Condition.
- **Sincronização 2-Way Google Calendar**: A ponte de Service Account gera, modifica e limpa eventos de agenda direto no Google Agenda mestre da barbearia à medida que os clientes realizam e cancelam marcações via app.
- **Painel Administrativo Privado**: Um portal prático e rápido para listagem dos agendamentos do dia, deleção forçada, e gerenciamento dos pacotes listados.
- **Conceitos UI/UX Polidos**: Foco na fluidez. Utilizando animações e tempos de carregamento falsos reduzidos (*skeletons/loading states*) para que o cliente da barbearia navegue de maneira rica pelo celular.

## 🚀 Tecnologias e Stack

- **Framework Web:** [Next.js](https://nextjs.org/) (App Directory e Server Actions)
- **Estilização e Componentes:** [Tailwind CSS 4.0](https://tailwindcss.com/) + CSS puro para transições. 
- **Linguagem:** TypeScript puro; focado em verificação estática das rotas back-end.
- **Bancos Remotos:** [Supabase](https://supabase.com/).
- **Integração:** Google OAuth2 Client (`googleapis`) para gerir calendário.

## ⚙️ Como Executar o Projeto Localmente

> **Aviso de Credenciais:** Para rodar a autenticação de banco de dados e os serviços de sincronia, será necessário uma conta padrão gratuita no Supabase e uma Service Account válida na Google Cloud (com GCal ativado). Consulte o modelo estático no `.env.example`.

**1. Faça o Clone deste repositório:**
```sh
git clone https://github.com/JaoV1ctor/Gu-cortes.git
cd Gu-cortes
```

**2. Instale as dependências com NPM:**
```sh
npm install
```

**3. Configure as Chaves (Variáveis de Ambiente):**
Em seu diretório clonado, duplique e renomeie o `.env.example` para `.env.local`:
```sh
cp .env.example .env.local
```
> Após copiar, injete a Anon Key e o host do Supabase, o seu e-mail do Google, e crie o arquivo **`credentials.json`** na pasta raiz apontando sua Service Account (formato gerado pelo Google).

**4. Execute o servidor Next local no ambiente de desenvolvimento:**
```sh
npm run dev
```

**5. Validação:**
O app deverá se hospedar e escutar tráfegos pela interface `http://localhost:3000`. Acesse as pastas `app/admin` para verificar os protótipos listados.

## 🗄 Infraestrutura do Banco (PostgreSQL)

O projeto usa `B-Tree` mistas para calcular reservas ativas nos dados das consultas. Suas tabelas primárias são:

- **`appointments`**: Histórico bruto. Valida em tempo direto com *tsrange*. Recebe registros primários `id`, dados dos usuários e o retorno persistente em ID da sincronia do calendário externo via Web API.
- **`services`**: Painel flexível puxando dinamicamente e injetando as fotos enviadas no agendamento. 

Caso queira injetar do zero: Dê uma olhada nos comandos DDL exportados na pasta `architecture/`.

---

<div align="center">
Repositório mantido e montado sob arquitetura serveless (funções de ponta - Edge/Vercel) para portfólio de engenharia.<br/> 
<b>Desenvolvido por João Victor</b>. 🧑‍💻
</div>
