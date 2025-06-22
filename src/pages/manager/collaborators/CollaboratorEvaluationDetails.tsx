import { type FC, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Star } from "lucide-react"
import DashboardService from "../../../services/DashboardService"
import { useGlobalToast } from "../../../hooks/useGlobalToast"
import type { DetailedSelfAssessment } from "../../../types/detailedEvaluations"

interface ManagerCriterionState {
  score: number
  justification: string
}

const ALLOWED_CRITERIA_IDS = [
  "sentimento-de-dono",
  "resiliencia-adversidades",
  "organizacao-trabalho",
  "capacidade-aprender",
  "team-player",
];

const CollaboratorEvaluationDetails: FC = () => {
  const { id: collaboratorIdFromUrl } = useParams<{ id: string }>()
  const toast = useGlobalToast()

  const [detailedSelfAssessment, setDetailedSelfAssessment] = useState<DetailedSelfAssessment | null>(null)
  const [activeCycleName, setActiveCycleName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCriterion, setExpandedCriterion] = useState<Set<string>>(new Set())

  const [collaboratorName, setCollaboratorName] = useState("Colaborador Avaliado")
  const [collaboratorJobTitle, setCollaboratorJobTitle] = useState("Cargo do Colaborador")

  const [managerAssessments, setManagerAssessments] = useState<Record<string, ManagerCriterionState>>({})
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false)

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

        const dashboardData = await DashboardService.getManagerDashboard(activeCycle.name)
        const foundCollaborator = dashboardData.collaboratorsInfo
          .flatMap((group) => group.subordinates)
          .find((sub) => sub.id === collaboratorIdFromUrl)

        if (foundCollaborator) {
          setCollaboratorName(foundCollaborator.name)
          setCollaboratorJobTitle(foundCollaborator.jobTitle)
        } else {
          setCollaboratorName("Colaborador Desconhecido")
          setCollaboratorJobTitle("Cargo Desconhecido")
        }

        const fullEvaluation = await DashboardService.getCollaboratorFullEvaluation(collaboratorIdFromUrl, activeCycle.name)

        const initialManagerAssessments: Record<string, ManagerCriterionState> = {}

        if (fullEvaluation.managerAssessments && fullEvaluation.managerAssessments.length > 0) {
          const managerExistingAssessment = fullEvaluation.managerAssessments[0]
          managerExistingAssessment.answers.forEach(answer => {
            if (ALLOWED_CRITERIA_IDS.includes(answer.criterionId)) {
              initialManagerAssessments[answer.criterionId] = {
                score: answer.score,
                justification: answer.justification
              }
            }
          })
        }

        ALLOWED_CRITERIA_IDS.forEach((criterionId) => {
          if (!initialManagerAssessments[criterionId]) {
            initialManagerAssessments[criterionId] = { score: 0, justification: "" }
          }
        })

        setManagerAssessments(initialManagerAssessments)

        const isSubmitted = ALLOWED_CRITERIA_IDS.every((criterionId) => {
          const assessment = initialManagerAssessments[criterionId]
          return (
            assessment &&
            assessment.score >= 1 &&
            assessment.score <= 5 &&
            assessment.justification.trim() !== ""
          )
        })
        setIsAssessmentSubmitted(isSubmitted)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dados de avaliação."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessmentData()
  }, [collaboratorIdFromUrl])

  const handleManagerRatingChange = (criterionId: string, score: number) => {
    if (isAssessmentSubmitted) return
    setManagerAssessments((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score },
    }))
  }

  const handleManagerJustificationChange = (criterionId: string, justification: string) => {
    if (isAssessmentSubmitted) return
    setManagerAssessments((prev) => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], justification },
    }))
  }

  const getManagerCompletionCount = () => {
    const total = ALLOWED_CRITERIA_IDS.length
    const completed =
      ALLOWED_CRITERIA_IDS.filter((criterionId) => {
        const managerAssessment = managerAssessments[criterionId]
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

    const payloadToSend: Record<string, any> = {
      evaluatedUserId: collaboratorIdFromUrl,
    }

    ALLOWED_CRITERIA_IDS.forEach((criterionId) => {
      const camelCaseCriterion = criterionId.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      const managerAssessment = managerAssessments[criterionId]
      if (managerAssessment) {
        payloadToSend[`${camelCaseCriterion}Score`] = managerAssessment.score
        payloadToSend[`${camelCaseCriterion}Justification`] = managerAssessment.justification
      }
    })

    try {
      await DashboardService.submitManagerSubordinateAssessment(payloadToSend as any)
      toast.success("Sucesso", "Avaliação do gestor enviada com sucesso!")
      setIsAssessmentSubmitted(true)
    } catch (submitError) {
      const msg = submitError instanceof Error ? submitError.message : "Falha ao enviar avaliação."
      toast.error("Erro", msg)
    }
  }

  const { completed, total } = getManagerCompletionCount()

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

  const getInitials = (name: string): string => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const getCriterionName = (criterionId: string): string => {
    const map: Record<string, string> = {
      "sentimento-de-dono": "Sentimento de Dono",
      "resiliencia-adversidades": "Resiliência nas Adversidades",
      "organizacao-trabalho": "Organização no Trabalho",
      "capacidade-aprender": "Capacidade de Aprender",
      "team-player": 'Ser "Team Player"',
    }
    return map[criterionId] || criterionId
  }

  const collaboratorInitials = getInitials(collaboratorName)

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
              {!isAssessmentSubmitted && (
                <button
                  onClick={handleSubmitManagerAssessment}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Concluir e enviar
                </button>
              )}
            </div>
          </div>

          <div className="h-12 flex items-center px-6 bg-white border-b border-gray-200">
            <div className="flex gap-6">
              <button className="relative text-sm font-medium text-teal-600 pb-3 border-b-2 border-teal-600">
                Avaliação
              </button>
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
                {ALLOWED_CRITERIA_IDS.map((criterionId, index) => {
                  const isExpanded = expandedCriterion.has(criterionId)
                  const managerScore = managerAssessments[criterionId]?.score || 0
                  const selfAnswer = detailedSelfAssessment?.answers.find(a => a.criterionId === criterionId)
                  const hasManagerAssessment =
                    managerScore > 0 && managerAssessments[criterionId]?.justification.trim() !== ""

                  return (
                    <div key={criterionId}>
                      <button
                        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => toggleCriterionExpansion(criterionId)}
                      >
                        <div className="flex items-center gap-3">
                          {hasManagerAssessment ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-600">
                              {index + 1}
                            </div>
                          )}
                          <h3 className="font-medium text-gray-900">{getCriterionName(criterionId)}</h3>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-gray-600">
                            {selfAnswer ? selfAnswer.score.toFixed(1) : "-"}
                          </div>
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
                                      starValue <= (selfAnswer?.score ?? 0)
                                        ? "text-teal-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">Justificativa</div>
                                <div className="bg-white p-3 rounded-md border border-gray-200 text-sm text-gray-700">
                                  {selfAnswer?.justification || "Nenhuma justificativa fornecida"}
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
                                    onClick={() => handleManagerRatingChange(criterionId, starValue)}
                                    className={`transition-colors hover:scale-110 ${
                                      isAssessmentSubmitted ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                    disabled={isAssessmentSubmitted}
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
                                  value={managerAssessments[criterionId]?.justification || ""}
                                  onChange={(e) =>
                                    handleManagerJustificationChange(criterionId, e.target.value)
                                  }
                                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none placeholder-gray-400 ${
                                    isAssessmentSubmitted ? "bg-gray-100 cursor-not-allowed" : ""
                                  }`}
                                  disabled={isAssessmentSubmitted}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CollaboratorEvaluationDetails
