import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownExample: React.FC = () => {
  const exampleInsights = `### Reconhecimento

Ana Beatriz, você tem demonstrado uma excelente qualidade técnica e organização, que são consistentemente reconhecidas por seus colegas e gestor. Seu senso de responsabilidade e capacidade de cumprir prazos são exemplares, como evidenciado pelas avaliações de 5/5 em vários critérios. Sua disposição para ajudar e colaborar com a equipe é notável e faz de você uma peça fundamental no time.

### Oportunidades

1. **Liderança Técnica**: Há uma oportunidade para você assumir mais iniciativas de liderança técnica em projetos. Isso pode fortalecer ainda mais sua posição e abrir portas para novas responsabilidades.
2. **Compartilhamento de Conhecimento**: Compartilhar mais do seu conhecimento técnico com a equipe pode não apenas ajudar seus colegas a crescer, mas também solidificar seu papel como uma referência técnica.
3. **Pensar Fora da Caixa**: Embora você já apresente soluções criativas, explorar ainda mais essa habilidade pode trazer inovações valiosas para os projetos.

### Dicas Práticas

1. **Assuma Iniciativas de Liderança**: Considere se voluntariar para liderar um projeto pequeno no próximo trimestre. Isso pode ser uma ótima maneira de desenvolver suas habilidades de liderança.
2. **Sessões de Compartilhamento de Conhecimento**: Agende sessões mensais para compartilhar insights ou novas tecnologias com sua equipe. Isso pode ser feito através de workshops ou apresentações informais.
3. **Desenvolvimento Criativo**: Reserve tempo semanalmente para explorar novas abordagens ou tecnologias que possam ser aplicadas aos projetos em que você está trabalhando.
4. **Feedback Contínuo**: Considere agendar 15 minutos semanais com cada membro da equipe para trocar feedbacks contínuos, o que pode fortalecer a colaboração e o espírito de equipe.

### Objetivos

1. **Liderança Técnica**: Almeje liderar pelo menos um projeto técnico até o final do próximo ciclo.
2. **Sessões de Compartilhamento**: Organize e conduza pelo menos três sessões de compartilhamento de conhecimento com a equipe durante o próximo semestre.
3. **Inovação**: Desenvolva uma solução inovadora para um desafio atual da equipe, aplicando suas habilidades criativas.

Seu desempenho até agora tem sido impressionante, e com essas ações, você poderá continuar a crescer e contribuir ainda mais para o sucesso da equipe. Continue com o excelente trabalho!`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Exemplo de Formatação Markdown</h1>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h2 className="text-xl font-semibold text-purple-800 mb-4">Insights Personalizados - Ana Beatriz</h2>
        
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <MarkdownRenderer content={exampleInsights} />
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Como usar:</h3>
        <p className="text-gray-600 text-sm">
          Este componente `MarkdownRenderer` foi integrado aos seguintes componentes:
        </p>
        <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
          <li><strong>PersonalInsightsCard</strong> - Exibe insights personalizados dos colaboradores</li>
          <li><strong>SummaryBox</strong> - Usado em dashboards para exibir resumos</li>
          <li><strong>CollaboratorEvolutionModal</strong> - Modal de evolução histórica</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkdownExample; 