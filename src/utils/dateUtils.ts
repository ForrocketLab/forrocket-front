/**
 * Utilitários para formatação segura de datas
 */

/**
 * Formatar data para formato brasileiro (DD/MM/AAAA)
 */
export const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Não informado';
  
  // Se for uma string vazia, retornar Não informado
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return 'Não informado';
  }
  
  try {
    let date: Date;
    
    // Lidar com diferentes tipos de entrada
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null) {
      // Se for um objeto, tentar extrair a string ISO ou timestamp
      if (dateValue.$date) {
        // Formato MongoDB/Prisma especial
        date = new Date(dateValue.$date);
      } else if (dateValue.toString && dateValue.toString() !== '[object Object]') {
        // Tentar converter toString()
        date = new Date(dateValue.toString());
      } else {
        console.warn('Objeto de data não reconhecido:', dateValue);
        return 'Formato de data inválido';
      }
    } else {
      console.warn('Tipo de data não suportado:', typeof dateValue, dateValue);
      return 'Tipo de data inválido';
    }
    
    // Verificar se a data é válida
    if (!date || isNaN(date.getTime())) {
      console.warn('Data inválida:', dateValue);
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.warn('Erro ao formatar data:', dateValue, error);
    return 'Erro na data';
  }
};

/**
 * Formatar data e hora para formato brasileiro (DD/MM/AAAA HH:MM:SS)
 */
export const formatDateTime = (dateValue: any): string => {
  if (!dateValue) return 'Não informado';
  
  // Se for uma string vazia, retornar Não informado
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return 'Não informado';
  }
  
  try {
    let date: Date;
    
    // Lidar com diferentes tipos de entrada
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null) {
      // Se for um objeto, tentar extrair a string ISO ou timestamp
      if (dateValue.$date) {
        // Formato MongoDB/Prisma especial
        date = new Date(dateValue.$date);
      } else if (dateValue.toString && dateValue.toString() !== '[object Object]') {
        // Tentar converter toString()
        date = new Date(dateValue.toString());
      } else {
        console.warn('Objeto de data/hora não reconhecido:', dateValue);
        return 'Formato de data/hora inválido';
      }
    } else {
      console.warn('Tipo de data/hora não suportado:', typeof dateValue, dateValue);
      return 'Tipo de data/hora inválido';
    }
    
    // Verificar se a data é válida
    if (!date || isNaN(date.getTime())) {
      console.warn('Data/hora inválida:', dateValue);
      return 'Data/hora inválida';
    }
    
    return date.toLocaleString('pt-BR');
  } catch (error) {
    console.warn('Erro ao formatar data e hora:', dateValue, error);
    return 'Erro na data/hora';
  }
};

/**
 * Formatar data e hora com formato detalhado
 */
export const formatDateTimeDetailed = (dateValue: any): string => {
  if (!dateValue) return 'Não informado';
  
  // Se for uma string vazia, retornar Não informado
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return 'Não informado';
  }
  
  try {
    let date: Date;
    
    // Lidar com diferentes tipos de entrada
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null) {
      // Se for um objeto, tentar extrair a string ISO ou timestamp
      if (dateValue.$date) {
        // Formato MongoDB/Prisma especial
        date = new Date(dateValue.$date);
      } else if (dateValue.toString && dateValue.toString() !== '[object Object]') {
        // Tentar converter toString()
        date = new Date(dateValue.toString());
      } else {
        console.warn('Objeto de data/hora detalhada não reconhecido:', dateValue);
        return 'Formato de data/hora inválido';
      }
    } else {
      console.warn('Tipo de data/hora detalhada não suportado:', typeof dateValue, dateValue);
      return 'Tipo de data/hora inválido';
    }
    
    // Verificar se a data é válida
    if (!date || isNaN(date.getTime())) {
      console.warn('Data/hora detalhada inválida:', dateValue);
      return 'Data/hora inválida';
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.warn('Erro ao formatar data e hora detalhada:', dateValue, error);
    return 'Erro na data/hora';
  }
};

/**
 * Verificar se uma data é válida
 */
export const isValidDate = (dateValue: any): boolean => {
  if (!dateValue) return false;
  
  try {
    let date: Date;
    
    // Lidar com diferentes tipos de entrada
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null) {
      // Se for um objeto, tentar extrair a string ISO ou timestamp
      if (dateValue.$date) {
        // Formato MongoDB/Prisma especial
        date = new Date(dateValue.$date);
      } else if (dateValue.toString && dateValue.toString() !== '[object Object]') {
        // Tentar converter toString()
        date = new Date(dateValue.toString());
      } else {
        return false;
      }
    } else {
      return false;
    }
    
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Função para debug - mostrar o que está sendo recebido
 */
export const debugFormatDate = (dateValue: any): string => {
  console.log('DEBUG formatDate - Valor recebido:', {
    value: dateValue,
    type: typeof dateValue,
    isNull: dateValue === null,
    isUndefined: dateValue === undefined,
    isEmpty: dateValue === '',
    stringValue: String(dateValue),
    isDate: dateValue instanceof Date,
    isObject: typeof dateValue === 'object' && dateValue !== null,
    objectKeys: typeof dateValue === 'object' && dateValue !== null ? Object.keys(dateValue) : null,
    objectPrototype: typeof dateValue === 'object' && dateValue !== null ? Object.prototype.toString.call(dateValue) : null,
    hasDollarDate: typeof dateValue === 'object' && dateValue !== null && '$date' in dateValue,
    toString: typeof dateValue === 'object' && dateValue !== null ? dateValue.toString() : null
  });
  
  return formatDate(dateValue);
}; 