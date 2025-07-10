import { type FC, useState } from 'react';
import { X, FileText, Loader, ChevronDown } from 'lucide-react';
interface ImportDetailsModalProps {
  details: any | null;
  onClose: () => void;
  isLoading: boolean;
}

const AccordionItem: FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <span className="font-semibold text-gray-800">{title} ({count})</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const ImportDetailsModal: FC<ImportDetailsModalProps> = ({ details, onClose, isLoading }) => {
  if (!details && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Detalhes da Importação</h2>
              <p className="text-sm text-gray-500">{details?.fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : details && (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs font-medium text-gray-500">STATUS</p><p className="text-lg font-bold text-gray-800">{details.overallStatus}</p></div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-xs font-medium text-green-700">CRIADOS</p><p className="text-lg font-bold text-green-700">{details.totalRecordsCreated}</p></div>
                <div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs font-medium text-blue-700">ATUALIZADOS</p><p className="text-lg font-bold text-blue-700">{details.totalRecordsUpdated}</p></div>
                <div className="bg-red-50 p-3 rounded-lg"><p className="text-xs font-medium text-red-700">ERROS</p><p className="text-lg font-bold text-red-700">{details.totalErrors}</p></div>
              </div>

              {/* Accordions com os detalhes */}
              <div className="space-y-4">
                {details.perfisImportados.length > 0 && (
                  <AccordionItem title="Perfis Importados" count={details.perfisImportados.length}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100"><tr><th className="p-2 text-left">Nome</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Ciclo</th><th className="p-2 text-left">Unidade</th></tr></thead>
                        <tbody>{details.perfisImportados.map((p: any) => (<tr key={p.id} className="border-b"><td className="p-2">{p.nome}</td><td className="p-2">{p.email}</td><td className="p-2">{p.ciclo}</td><td className="p-2">{p.unidade}</td></tr>))}</tbody>
                      </table>
                    </div>
                  </AccordionItem>
                )}
                {details.autoAvaliacoesImportadas.length > 0 && (
                  <AccordionItem title="Autoavaliações Importadas" count={details.autoAvaliacoesImportadas.length}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Critério</th><th className="p-2 text-center">Nota</th><th className="p-2 text-left">Justificativa</th></tr></thead>
                          <tbody>{details.autoAvaliacoesImportadas.map((a: any) => (<tr key={a.id} className="border-b"><td className="p-2">{a.criterio}</td><td className="p-2 text-center">{a.autoAvaliacao}</td><td className="p-2">{a.dadosFatosAutoAvaliacao}</td></tr>))}</tbody>
                        </table>
                    </div>
                  </AccordionItem>
                )}
                {details.avaliacoes360Importadas.length > 0 && (
                  <AccordionItem title="Avaliações 360 Importadas" count={details.avaliacoes360Importadas.length}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Email Avaliado</th><th className="p-2 text-center">Nota</th><th className="p-2 text-left">Pontos a Melhorar</th><th className="p-2 text-left">Pontos a Explorar</th></tr></thead>
                          <tbody>{details.avaliacoes360Importadas.map((a: any) => (<tr key={a.id} className="border-b"><td className="p-2">{a.emailAvaliado}</td><td className="p-2 text-center">{a.notaGeralColaborador}</td><td className="p-2">{a.pontosMelhorar}</td><td className="p-2">{a.pontosExplorar}</td></tr>))}</tbody>
                        </table>
                    </div>
                  </AccordionItem>
                )}
                {details.pesquisasReferenciaImportadas.length > 0 && (
                  <AccordionItem title="Pesquisas de Referências Importadas" count={details.pesquisasReferenciaImportadas.length}>
                     <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Email Referência</th><th className="p-2 text-left">Justificativa</th></tr></thead>
                          <tbody>{details.pesquisasReferenciaImportadas.map((p: any) => (<tr key={p.id} className="border-b"><td className="p-2">{p.emailReferencia}</td><td className="p-2">{p.justificativa}</td></tr>))}</tbody>
                        </table>
                    </div>
                  </AccordionItem>
                )}
              </div>
            </>
          )}
        </main>

        <footer className="p-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Fechar</button>
        </footer>
      </div>
    </div>
  );
};

export default ImportDetailsModal;