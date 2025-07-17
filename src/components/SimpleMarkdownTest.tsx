import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const SimpleMarkdownTest: React.FC = () => {
  const testMarkdown = `### Reconhecimento

Você tem demonstrado uma **excelente qualidade técnica** e organização, que são consistentemente reconhecidas por seus colegas e gestor.

### Oportunidades

1. **Liderança Técnica**: Há uma oportunidade para você assumir mais iniciativas de liderança técnica em projetos.
2. **Compartilhamento de Conhecimento**: Compartilhar mais do seu conhecimento técnico com a equipe.

### Dicas Práticas

- Considere se voluntariar para liderar um projeto pequeno
- Agende sessões mensais para compartilhar insights
- Reserve tempo semanalmente para explorar novas abordagens

*Continue com o excelente trabalho!*`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Formatação Markdown</h1>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <MarkdownRenderer content={testMarkdown} />
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Status da Implementação:</h2>
        <p className="text-sm text-gray-700">
          ✅ Biblioteca react-markdown instalada<br/>
          ✅ Componente MarkdownRenderer criado<br/>
          ✅ Integrado ao PersonalInsightsCard<br/>
          ✅ Integrado ao SummaryBox<br/>
          ✅ Integrado ao CollaboratorEvolutionModal
        </p>
      </div>
    </div>
  );
};

export default SimpleMarkdownTest; 