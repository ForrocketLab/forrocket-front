import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import SelfEvaluation from '../../components/evaluation/SelfEvaluation';
import EvaluationService, { type UserEvaluationsByCycleResponse } from '../../services/EvaluationService'; 

type ActiveTab = 'self' | '360' | 'mentoring' | 'references';

const EvaluationCicle: React.FC = () => {
  const navigate = useNavigate(); 

  const [activeTab, setActiveTab] = useState<ActiveTab>('self');
  const [cycleData, setCycleData] = useState<UserEvaluationsByCycleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCycleData = async () => {
    setLoading(true);
    setError(null);
    const currentCycleId = "2025.1"; 
    try {
      const data = await EvaluationService.getUserEvaluationsByCycle(currentCycleId);
      setCycleData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do ciclo.');
      console.error("Erro ao carregar dados do ciclo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, []); 

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando ciclo de avaliação...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Erro: {error}</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '250px', backgroundColor: '#ffffff', padding: '20px', borderRight: '1px solid #eee', boxShadow: '2px 0 5px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#333', marginBottom: '30px' }}>RPE</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', color: '#666', fontWeight: 'bold' }}>
            <span style={{ marginRight: '10px' }}>📊</span> Dashboard
          </li>
          <li
            style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', backgroundColor: '#e0f7fa', padding: '10px', borderRadius: '5px', cursor: 'pointer', color: '#007bff' }}
            onClick={() => navigate('/evaluation')} 
          >
            <span style={{ marginRight: '10px' }}>📝</span> Avaliação de ciclo <span style={{ marginLeft: 'auto', backgroundColor: '#007bff', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7em' }}>1</span>
          </li>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', color: '#666' }}>
            <span style={{ marginRight: '10px' }}>📈</span> Evolução
          </li>
        </ul>
        <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#666' }}>
            <span style={{ marginRight: '10px', fontSize: '1.2em' }}>👤</span> Colaborador 1
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#dc3545', cursor: 'pointer' }}>
            <span style={{ marginRight: '10px', fontSize: '1.2em' }}>➡️</span> Logout
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '30px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', fontSize: '2em' }}>Ciclo {cycleData?.cycle || '2025.1'}</h1>
          <button
            onClick={() => {}}
            style={{ padding: '12px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}
          >
            Concluir e enviar
          </button>
        </div>

        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <button
            onClick={() => setActiveTab('self')}
            style={{ marginRight: '15px', padding: '12px 20px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold',
              backgroundColor: activeTab === 'self' ? '#e0f7fa' : 'transparent',
              color: activeTab === 'self' ? '#007bff' : '#666'
            }}
          >
            Autoavaliação
          </button>
          <button
            onClick={() => setActiveTab('360')}
            style={{ marginRight: '15px', padding: '12px 20px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold',
              backgroundColor: activeTab === '360' ? '#e0f7fa' : 'transparent',
              color: activeTab === '360' ? '#007bff' : '#666'
            }}
          >
            Avaliação 360
          </button>
          <button
            onClick={() => setActiveTab('mentoring')}
            style={{ marginRight: '15px', padding: '12px 20px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold',
              backgroundColor: activeTab === 'mentoring' ? '#e0f7fa' : 'transparent',
              color: activeTab === 'mentoring' ? '#007bff' : '#666'
            }}
          >
            Mentoring
          </button>
          <button
            onClick={() => setActiveTab('references')}
            style={{ padding: '12px 20px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold',
              backgroundColor: activeTab === 'references' ? '#e0f7fa' : 'transparent',
              color: activeTab === 'references' ? '#007bff' : '#666'
            }}
          >
            Referências
          </button>
        </div>

        {activeTab === 'self' && (
          <SelfEvaluation
            initialSelfAssessmentData={cycleData?.selfAssessment ?? null}
            cycleId={cycleData?.cycle || "2025.1"}
            onSubmissionSuccess={() => fetchCycleData()}
          />
        )}
        {activeTab === '360' && <div>Conteúdo da Avaliação 360</div>}
        {activeTab === 'mentoring' && <div>Conteúdo da Avaliação de Mentoring</div>}
        {activeTab === 'references' && <div>Conteúdo do Feedback de Referências</div>}

      </div>
    </div>
  );
};

export default EvaluationCicle;