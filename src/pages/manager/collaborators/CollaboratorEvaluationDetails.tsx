import { type FC, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Star } from "lucide-react"
import DashboardService from "../../../services/DashboardService"
import { useGlobalToast } from "../../../hooks/useGlobalToast"
import type {
  DetailedSelfAssessment,
  SelfAssessmentAnswer,
  CreateManagerSubordinateAssessment,
} from "../../../types/detailedEvaluations"

interface ManagerCriterionState {
  score: number
  justification: string
}

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>()
  const toast = useGlobalToast()

  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null)
  const [activeCycleName, setActiveCycleName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set())

  // Estados para armazenar o nome e o cargo do colaborador dinamicamente
  const [collaboratorName, setCollaboratorName] = useState("Colaborador Avaliado") // Valor inicial de placeholder
  const [collaboratorJobTitle, setCollaboratorJobTitle] = useState("Cargo do Colaborador") // Valor inicial de placeholder

  const [managerAssessments, setManagerAssessments] = useState<Record<string, ManagerCriterionState>>({})

  useEffect(() => {
    if (!collaboratorIdFromUrl) {
      setError("ID do colaborador não fornecido na URL.")
      setIsLoading(false)
      return
    }

    const fetchAssessmentData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const activeCycle = await DashboardService.getActiveCycle()
        setActiveCycleName(activeCycle.name)

        const selfAssessment = await DashboardService.getDetailedSelfAssessment(collaboratorIdFromUrl)
        setDetailedSelfAssessment(selfAssessment)

        // Buscar dados do dashboard para obter o nome e o cargo do colaborador
        // Esta é uma solução alternativa se 'detailedSelfAssessment' não contiver isso diretamente
        const dashboardData = await DashboardService.getManagerDashboard(activeCycle.name)
        const foundCollaborator = dashboardData.collaboratorsInfo
          .flatMap((group) => group.subordinates)
          .find((sub) => sub.id === collaboratorIdFromUrl)

        if (foundCollaborator) {
          setCollaboratorName(foundCollaborator.name)
          setCollaboratorJobTitle(foundCollaborator.jobTitle)
        } else {
          // Fallback se não for encontrado nos dados do dashboard
          setCollaboratorName("Colaborador Desconhecido")
          setCollaboratorJobTitle("Cargo Desconhecido")
        }

        const initialManagerAssessments: Record<string, ManagerCriterionState> = {}
        selfAssessment.answers.forEach((answer) => {
          initialManagerAssessments[answer.criterionId] = { score: 0, justification: "" }
        })
        setManagerAssessments(initialManagerAssessments)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados de avaliação."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessmentData()
  }, [collaboratorIdFromUrl]) // Depende de collaboratorIdFromUrl

  const handleManagerRatingChange = (criterionId: string, score: number) => {
    setManagerAssessments((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score },
    }))
  }

  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    setManagerAssessments((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification },
    }))
  }

  const getManagerCompletionCount = () => {
    const total = detailedSelfAssessment?.answers.length || 0
    const completed =
      detailedSelfAssessment?.answers.filter((answer) => {
        const managerAssessment = managerAssessments[answer.criterionId]
        return (
          managerAssessment &&
          managerAssessment.score >= 1 &&
          managerAssessment.score <= 5 &&
          managerAssessment.justification.trim() !== ""
        )
      }).length || 0

    return { completed, total }
  }

  const handleSubmitManagerAssessment = async () => {
    if (!collaboratorIdFromUrl) {
      toast.error("Erro", "ID do colaborador não disponível para submeter a avaliação.")
      return
    }

    if (!detailedSelfAssessment || !activeCycleName) {
      toast.error("Erro", "Dados incompletos para submeter a avaliação.")
      return
    }

    const { completed, total } = getManagerCompletionCount()

    if (completed < total) {
      toast.warning("Avaliação Incompleta", "Por favor, avalie e justifique cada critério com uma nota de 1 a 5.")
      return
    }

    const payload: CreateManagerSubordinateAssessment = {
      evaluatedUserId: collaboratorIdFromUrl,
      cycle: activeCycleName,
      assessments: Object.entries(managerAssessments).map(([criterionId, data]) => ({
        criterionId,
        score: data.score,
        justification: data.justification,
      })),
    }

    try {

      toast.success("Sucesso", "Avaliação do gestor enviada com sucesso!")
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : "Falha ao enviar avaliação."
      toast.error("Erro", msg)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-gray-700">Carregando dados de avaliação...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!detailedSelfAssessment) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dados de autoavaliação não encontrados</h3>
            <p className="text-gray-600 mb-4">
              Verifique se o colaborador possui uma autoavaliação para o ciclo atual.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Voltar para Colaboradores
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getCriterionName = (criterionId: string): string => {
    const map: Record<string, string> = {
      "atender-prazos": "Atender Prazos",
      "capacidade-aprender": "Capacidade de Aprender",
      "entregar-qualidade": "Entregar Qualidade",
      "evolucao-rocket": "Evolução Rocket",
      "fazer-mais-menos": "Fazer Mais com Menos",
      "gestao-gente": "Gestão de Pessoas",
      "gestao-resultados": "Gestão de Resultados",
      "organizacao-trabalho": "Organização no Trabalho",
      "pensar-fora-caixa": "Pensar Fora da Caixa",
      "resiliencia-adversidades": "Resiliência nas Adversidades",
      "sentimento-de-dono": "Sentimento de Dono",
      "team-player": 'Ser "Team Player"',
    }
    return map[criterionId] || criterionId.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase())
  }

  const getInitials = (name: string): string => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const collaboratorInitials = getInitials(collaboratorName) 

  const toggleCriterionExpansion = (criterionId: string) => {
    setExpandedCriterion((prevSet) => {
      const newSet = new Set(prevSet)
      if (newSet.has(criterionId)) {
        newSet.delete(criterionId)
      } else {
        newSet.add(criterionId)
      }
      return newSet
    })
  }

  const { completed, total } = getManagerCompletionCount()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1">
        <header className="fixed top-0 left-[256px] right-0 bg-white z-10 shadow-sm">
          <div className="h-16 w-full flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Avaliação de {collaboratorName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center font-semibold text-teal-700 text-sm">
                {collaboratorInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{collaboratorName}</span>
                <span className="text-xs text-gray-500">{collaboratorJobTitle}</span>
              </div>
              <button
                onClick={handleSubmitManagerAssessment}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Concluir e enviar
              </button>
            </div>
          </div>

          <div className="h-12 flex items-center px-6 bg-white border-b border-gray-200">
            <div className="flex gap-6">
              <button className="relative text-sm font-medium text-teal-600 pb-3 border-b-2 border-teal-600">
                Avaliação
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">Avaliação 360</button>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">Histórico</button>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-28 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Critérios de Postura</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded">
                    {completed}/{total} preenchidos
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {detailedSelfAssessment.answers.length > 0 ? (
                  detailedSelfAssessment.answers.map((answer, index) => {
                    const isExpanded = expandedCriterion.has(answer.criterionId)
                    const managerScore = managerAssessments[answer.criterionId]?.score || 0
                    const hasManagerAssessment =
                      managerScore > 0 && managerAssessments[answer.criterionId]?.justification.trim() !== ""

                    return (
                      <div key={answer.id}>
                        <button
                          className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCriterionExpansion(answer.criterionId)}
                        >
                          <div className="flex items-center gap-3">
                            {hasManagerAssessment ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-600">
                                {index + 1}
                              </div>
                            )}
                            <h3 className="font-medium text-gray-900">{getCriterionName(answer.criterionId)}</h3>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-sm font-medium text-gray-600">{answer.score.toFixed(1)}</div>
                            <div className="text-sm font-medium text-gray-900">
                              {managerScore > 0 ? managerScore.toFixed(1) : "-"}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-700">Autoavaliação</div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((starValue) => (
                                    <Star
                                      key={starValue}
                                      className={`w-5 h-5 ${
                                        starValue <= answer.score ? "text-teal-500 fill-current" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-2">Justificativa</div>
                                  <div className="bg-white p-3 rounded-md border border-gray-200 text-sm text-gray-700">
                                    {answer.justification || "Nenhuma justificativa fornecida"}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-700">
                                  Sua avaliação de 1 a 5 com base no critério
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((starValue) => (
                                    <button
                                      key={starValue}
                                      type="button"
                                      onClick={() => handleManagerRatingChange(answer.criterionId, starValue)}
                                      className="transition-colors hover:scale-110"
                                    >
                                      <Star
                                        className={`w-5 h-5 ${
                                          starValue <= managerScore
                                            ? "text-teal-600 fill-current"
                                            : "text-gray-300 hover:text-teal-400"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-2">Justifique sua nota</div>
                                  <textarea
                                    rows={4}
                                    placeholder="Justifique sua nota..."
                                    value={managerAssessments[answer.criterionId]?.justification || ""}
                                    onChange={(e) =>
                                      handleManagerJustificationChange(answer.criterionId, e.target.value)
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none placeholder-gray-400"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">Nenhum critério de autoavaliação encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CollaboratorEvaluationDetails