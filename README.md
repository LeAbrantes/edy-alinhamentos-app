# Edy Alinhamentos – App de Agendamento de Serviços Automotivos

Aplicativo mobile (React Native + Expo) para a oficina **Edy Alinhamentos & Serviços**, criado como
projeto de extensão da disciplina **Programação para Dispositivos Móveis em Mobile** (UNESA).
É a versão mobile do sistema web `edy_agendamento.html` da oficina: cadastro de clientes/veículos,
escolha de serviços e horários, agenda com filtros e painel com estatísticas.

## Requisitos da atividade × onde estão no projeto

| Requisito | Como foi atendido | Arquivos principais |
|---|---|---|
| Recurso do celular | **Notificações locais** (confirmação imediata + lembrete 1 h antes do atendimento) | `src/services/notificationService.js` |
| FlatList | Agenda, Painel (próximos agendamentos) e seletor de datas (horizontal) | `AgendaScreen.js`, `DashboardScreen.js`, `NewAppointmentScreen.js` |
| Login com criptografia | **Hash SHA-256 com salt** na senha (cadastro e login) | `src/utils/crypto.js`, `src/services/authService.js` |
| Persistência via Firebase | **Cloud Firestore** (coleções `usuarios` e `agendamentos`), com atualização em tempo real | `src/config/firebase.js`, `src/services/*.js` |
| Mínimo de 3 telas | **6 telas** (Login, Cadastro, Agendar, Agenda, Painel, Detalhes) | `src/screens/` |
| Testes automatizados (Jest) | **136 testes em 19 suítes**, cobertura de ~97 % das linhas | `__tests__/`, `docs/RESULTADO_TESTES.txt` |

## Funcionalidades (item 1.4 do Roteiro)

- **Login e cadastro de usuários** da oficina; a senha nunca é guardada: só o hash SHA-256 com salt; a sessão fica salva no aparelho.
- **Novo agendamento:** nome, telefone (com máscara), veículo, placa (com máscara), observações, data (14 dias à frente),
  um ou mais serviços (Borracharia, Balanceamento, Alinhamento, Scanner, Troca de Óleo, Freios, Suspensão, Outros)
  e horário (07:30 às 18:00). Horários já ocupados ficam bloqueados; cancelar libera o horário.
- **Notificações:** ao confirmar, o app avisa na hora e agenda um lembrete 60 minutos antes do atendimento. A tela de
  detalhes mostra a que horas o lembrete vai tocar. Se o agendamento for concluído ou cancelado, o lembrete é cancelado.
- **Agenda:** lista com filtros (Todos, Hoje, Esta semana, Pendentes) e busca por nome, carro ou placa.
- **Painel:** totais (Total, Hoje, Confirmados, Concluídos) e próximos agendamentos.
- **Detalhes:** dados completos, aviso do lembrete programado, marcar como **Concluído** ou **Cancelar** (com confirmação).

## Esquema de navegação

```
        ┌────────── não logado ──────────┐
        │  Login  ◄──────────►  Cadastro │
        └───────────────┬────────────────┘
                        │ entrar / cadastrar
        ┌───────────────▼────────────────┐
        │      Menu inferior (abas)      │
        │ 📅 Agendar │ 📋 Agenda │ 📊 Painel │
        └──────┬────────────┬────────┬───┘
     após salvar│  toque no item  │ toque no item
               ▼            ▼        ▼
                    Detalhes do agendamento
              (lembrete, concluir, cancelar)
```

## Persistência de dados via Firestore (item 2.6 do Roteiro)

**Coleção `usuarios`**

| Campo | Tipo | Exemplo |
|---|---|---|
| `nome` | string | `"Edy"` |
| `email` | string (minúsculo) | `"edy@oficina.com"` |
| `salt` | string aleatória (UUID), única por usuário | `"3f2b9c1e-…"` |
| `senhaHash` | SHA-256 de `salt + senha`, em hexadecimal (64 caracteres) | `"ba7816bf8f01cfea…"` |
| `criadoEm` | string ISO | `"2026-11-19T17:00:00.000Z"` |

**Coleção `agendamentos`**

| Campo | Tipo | Exemplo |
|---|---|---|
| `name`, `phone`, `car`, `plate`, `notes` | string | `"João Silva"`, `"(21) 99999-8888"`, … |
| `date` | string `AAAA-MM-DD` | `"2026-11-20"` |
| `slot` | string `HH:MM` | `"09:30"` |
| `service` | lista de strings | `["alinhamento", "balanceamento"]` |
| `status` | `confirmado` \| `concluido` \| `cancelado` | `"confirmado"` |
| `lembreteId` | string (id da notificação agendada) | `"a1b2…"` |
| `criadoPor` | string (e-mail de quem agendou) | `"edy@oficina.com"` |
| `createdAt` | string ISO | `"2026-11-19T17:00:00.000Z"` |

> **Dica para o relatório:** tire print das duas coleções no Console do Firebase (Firestore Database → Dados).

## Como rodar

### 1. Criar o projeto no Firebase (uma vez)

1. Acesse <https://console.firebase.google.com> → **Adicionar projeto**.
2. **Build → Firestore Database → Criar banco de dados** (modo de teste, região `southamerica-east1`).
3. **Configurações do projeto → Seus aplicativos → Web (`</>`)** → registre o app e copie as chaves.
4. Na aba **Regras** do Firestore, cole o conteúdo de `firestore.rules` e publique.

### 2. Configurar e iniciar o app

```bash
npm install
cp .env.example .env        # preencha com as chaves do Firebase
npx expo start
```

Abra o app **Expo Go** no celular e leia o QR Code exibido no terminal (celular e computador na mesma rede Wi‑Fi).

### 3. Rodar os testes automatizados

```bash
npm test                # roda todos os testes
npm run test:coverage   # testes + relatório de cobertura
```

Todos os testes usam simulações (mocks) do Firebase e das notificações, então rodam sem internet e sem `.env`.
A saída completa da última execução está em `docs/RESULTADO_TESTES.txt`.

## Gerar o APK (instalar sem o Expo Go)

O perfil `preview` do `eas.json` gera um **.apk** que pode ser instalado direto no Android.

```bash
npm install -g eas-cli
eas login                      # conta gratuita em https://expo.dev
eas init                       # vincula o projeto à sua conta (só na primeira vez)
```

O arquivo `.env` **não é enviado** para a nuvem (está no `.gitignore`), então as chaves do Firebase precisam ser
cadastradas no EAS antes do build. Cadastre cada variável do `.env.example` no ambiente `preview`
(por exemplo com `eas env:create`, ou envie o arquivo de uma vez com `eas env:push`; veja `eas env --help`).
Sem isso o app abre, mas o login acusa "Firebase não configurado".

```bash
eas build --platform android --profile preview
```

Ao terminar (uns 10 a 20 minutos), o terminal mostra um link e um código para baixar o `.apk`. No celular, permita
"instalar apps de fontes desconhecidas" e abra o arquivo. iPhone não instala `.apk`; para iOS seria preciso conta
Apple Developer (paga).

## Como demonstrar a notificação (para o vídeo)

O lembrete só é agendado se o horário dele ainda estiver no futuro (agendamento a mais de 1 hora de distância).
Os horários são de 30 em 30 minutos, então, para ver o lembrete tocar sem esperar, abra
`src/constants/services.js`, troque `REMINDER_MINUTES_BEFORE` de `60` para `5`, salve, e agende um horário que esteja
a mais de 5 minutos de agora. A notificação de confirmação aparece na hora; o lembrete, 5 minutos antes do horário.
Depois volte o valor para `60`. Na primeira vez, o celular pede permissão para enviar notificações: toque em Permitir.

## Estrutura de pastas

```
App.js                      Ponto de entrada (fontes, provedores, navegação)
src/
  config/                   Tema (cores do site) e conexão com o Firebase
  constants/                Serviços, horários e status da oficina
  utils/                    Lógica pura: hash de senha, máscaras, datas, filtros, validações
  services/                 Firebase (auth e agendamentos) e notificações
  context/                  Estado global: login, lista de agendamentos (tempo real), toast
  components/               Botão, campo, cartão de agendamento, etc.
  screens/                  As 6 telas
  navigation/               Pilha + abas
__tests__/                  Testes Jest (utils, services, context, components, screens, navigation)
docs/RESULTADO_TESTES.txt   Evidência da execução dos testes
firestore.rules             Regras didáticas do Firestore
```

## Softwares e bibliotecas usados (para o item 2.5 do Roteiro)

React Native 0.88 · Expo SDK 58 · Node.js/npm · Firebase JS SDK (Cloud Firestore) · React Navigation (stack + bottom tabs) ·
expo-crypto (SHA-256) · expo-notifications · AsyncStorage · Jest + jest-expo +
React Native Testing Library · Google Fonts (Barlow Condensed e Inter).

## O que mudou em relação ao site

- Data de "hoje" usa o **horário local** (o site usava UTC e, à noite no Brasil, mostrava o dia seguinte).
- Data é escolhida em uma faixa de 14 dias (mais prático no celular que um campo `date`).
- Novo: login, notificações (confirmação e lembrete) e verificação de horário duplicado no servidor.

## Limitações conhecidas (Citar em Considerações finais)

- **Segurança do login:** SHA-256 com salt é irreversível e bem melhor que uma cifra, mas é um hash *rápido*, e o
  cálculo acontece no próprio app. Como as regras do Firestore estão abertas (uso didático), quem ler o banco vê o
  hash e o salt. Em produção, use Firebase Authentication (ou bcrypt/argon2 em um servidor) e regras restritas.
- **Contas antigas:** se você chegou a testar uma versão anterior (que guardava a senha com cifra de César), apague
  os documentos da coleção `usuarios` no Console do Firebase e cadastre de novo, pois o formato dos campos mudou
  (`senha` virou `salt` + `senhaHash`).
- **Notificações:** são locais (agendadas no próprio aparelho). Se o app for desinstalado ou os dados do aparelho
  forem apagados, os lembretes somem. Notificações *push* remotas exigiriam servidor e um *development build*.
- Todos os usuários logados enxergam todos os agendamentos (modelo de uma oficina com equipe única).
