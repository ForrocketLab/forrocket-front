# Evolução Histórica - RH

## 📊 Visão Geral

A funcionalidade de **Evolução Histórica** permite ao RH visualizar e analisar a evolução dos colaboradores ao longo do tempo, fornecendo insights valiosos sobre tendências de performance, padrões organizacionais e áreas de desenvolvimento.

## 🎯 Funcionalidades

### 1. Dashboard Organizacional
- **Métricas principais**: Total de colaboradores, colaboradores com histórico, média atual e crescimento organizacional
- **Distribuição de performance**: Categorização em Alto Desempenho, Desempenho Sólido, Em Desenvolvimento e Crítico
- **Análise de tendências**: Colaboradores melhorando, estáveis ou declinando
- **Destaques e recomendações**: Insights automáticos sobre padrões identificados

### 2. Lista de Colaboradores
- **Visualização tabular** com informações detalhadas de cada colaborador
- **Filtros avançados**: 
  - Ordenação por nome, última nota, evolução ou total de ciclos
  - Filtros por tendência (melhorando, declinando, estável)
  - Filtros por performance (alto desempenho, crítico)
- **Indicadores visuais**: Ícones de tendência e badges de categorização

### 3. Detalhes do Colaborador (Modal)
- **Resumo geral**: Total de ciclos, média histórica, última nota e tendência
- **Evolução por pilares**: Análise detalhada de Comportamento, Execução e Gestão
- **Histórico de ciclos**: Tabela com todas as avaliações (autoavaliação, gestor, nota final)
- **Insights personalizados**: Recomendações específicas baseadas no padrão do colaborador

## 🛠️ Arquitetura Técnica

### Componentes Principais

#### `HistoricalEvolution.tsx`
- Componente principal da página
- Gerencia estado entre dashboard e lista de colaboradores
- Integra com hooks customizados para dados

#### `useHistoricalEvolution.ts`
- Hook customizado para gerenciar estado e chamadas à API
- Funções para dashboard, lista de colaboradores, detalhes e comparações
- Tratamento de erro centralizado

#### `CollaboratorEvolutionModal.tsx`
- Modal para exibir detalhes completos de um colaborador
- Carregamento assíncrono de dados detalhados
- Interface responsiva e intuitiva

#### `ProgressBar.tsx`
- Componente reutilizável para barras de progresso
- Customizável em cor, altura e estilo
- Animações suaves

### Integração com Backend

O frontend consome as seguintes APIs do backend:

```typescript
// Dashboard organizacional
GET /api/hr/evolution/dashboard

// Lista de colaboradores com filtros
GET /api/hr/evolution/collaborators/summary?sortBy=name&sortOrder=asc&filterBy=improving

// Detalhes de um colaborador
GET /api/hr/evolution/collaborators/{id}/detailed

// Comparação entre colaboradores
POST /api/hr/evolution/comparison

// Tendências organizacionais
GET /api/hr/evolution/trends?startCycle=2023-Q1&endCycle=2023-Q4

// Evolução de pilar específico
GET /api/hr/evolution/collaborators/{id}/pillar-evolution/{pillar}
```

## 🎨 Design e UX

### Princípios de Design
- **Clareza visual**: Uso de cores consistentes para diferentes estados/categorias
- **Hierarquia de informação**: Organização lógica de dados do geral para o específico
- **Feedback interativo**: Loading states, hovers e animações sutis
- **Responsividade**: Funciona bem em desktop e tablets

### Padrões de Cores
- **Verde**: Tendências positivas, alto desempenho
- **Azul**: Informações neutras, desempenho sólido
- **Amarelo**: Atenção, em desenvolvimento
- **Vermelho**: Alertas, performance crítica
- **Cinza**: Dados estáveis, informações secundárias

## 📋 Como Usar

### Para Acessar
1. Faça login como usuário com papel "RH"
2. No menu lateral, clique em "Evolução Histórica"
3. A página carregará automaticamente o dashboard organizacional

### Navegação
- **Dashboard**: Visão geral organizacional com métricas e tendências
- **Colaboradores**: Lista detalhada com filtros e ordenação
- **Botão de refresh**: Atualiza os dados em qualquer seção

### Análise de Colaborador
1. Na aba "Colaboradores", clique no ícone do olho (👁️) ao lado do nome
2. O modal abrirá com detalhes completos da evolução
3. Analise os pilares, histórico e insights
4. Feche o modal para continuar a análise

### Filtros Disponíveis
- **Ordenação**: Nome, Última Nota, Evolução, Total de Ciclos
- **Ordem**: Crescente ou Decrescente
- **Filtro por Tendência**: Todos, Melhorando, Declinando, Estável
- **Filtro por Performance**: Todos, Alto Desempenho, Crítico

## 🔄 Estados de Loading e Erro

### Loading States
- **Skeleton loading** durante carregamento inicial
- **Spinner** em operações assíncronas
- **Botão de refresh** com animação durante atualização

### Tratamento de Erros
- **Mensagens contextuais** para diferentes tipos de erro
- **Retry automático** em caso de falha de rede
- **Fallbacks** para dados indisponíveis

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- **Gráficos interativos** para visualização de tendências
- **Exportação de relatórios** em PDF/Excel
- **Notificações automáticas** para mudanças significativas
- **Comparação de grupos** por unidade de negócio
- **Predições de performance** baseadas em IA

### Otimizações Técnicas
- **Cache inteligente** para reduzir chamadas à API
- **Virtualização** para listas grandes de colaboradores
- **Progressive loading** para dados históricos extensos
- **Offline support** para consultas básicas

## 🔐 Segurança e Permissões

### Controle de Acesso
- **Autenticação JWT** obrigatória
- **Autorização por papel**: Apenas RH e Admin têm acesso
- **Logs de auditoria** para todas as consultas
- **Rate limiting** para prevenir abuso

### Privacidade de Dados
- **Dados sensíveis** tratados conforme LGPD
- **Anonimização** opcional para relatórios agregados
- **Retenção de dados** conforme políticas da empresa

## 📊 Métricas e Monitoramento

### Métricas de Uso
- **Páginas mais visitadas** (Dashboard vs Colaboradores)
- **Filtros mais utilizados** para otimização da UX
- **Tempo médio** de sessão na funcionalidade
- **Taxa de conversão** para ações (visualizar detalhes)

### Performance
- **Tempo de carregamento** de cada seção
- **Taxa de erro** das APIs
- **Uso de cache** e eficiência
- **Satisfação do usuário** via feedback

---

## 📞 Suporte

Para dúvidas técnicas ou sugestões de melhoria, entre em contato com a equipe de desenvolvimento ou abra uma issue no repositório do projeto. 