// src/config/evaluationCriteria.ts

export const ALLOWED_CRITERIA_IDS = [
  'sentimento-de-dono',
  'resiliencia-nas-adversidades',
  'organizacao-no-trabalho',
  'capacidade-de-aprender',
  'ser-team-player',
  'entregar-com-qualidade',
  'atender-aos-prazos',
  'fazer-mais-com-menos',
  'pensar-fora-da-caixa',
];

export const criteriaNames: Record<string, string> = {
  'sentimento-de-dono': 'Sentimento de Dono',
  'resiliencia-nas-adversidades': 'Resiliência nas adversidades',
  'organizacao-no-trabalho': 'Organização no Trabalho',
  'capacidade-de-aprender': 'Capacidade de aprender',
  'ser-team-player': 'Ser "team player"',
  'entregar-com-qualidade': 'Entregar com qualidade',
  'atender-aos-prazos': 'Atender aos prazos',
  'fazer-mais-com-menos': 'Fazer mais com menos',
  'pensar-fora-da-caixa': 'Pensar fora da caixa',
};