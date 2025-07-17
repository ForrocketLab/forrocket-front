import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UseAutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
}

interface AutoSaveConfig<T> {
  data: T;
  saveFn: (data: Partial<T>) => Promise<void>;
  options?: UseAutoSaveOptions;
}

export function useAutoSave<T extends Record<string, any>>({
  data,
  saveFn,
  options = {}
}: AutoSaveConfig<T>) {
  const { debounceMs = 500, enabled = true } = options;
  const { user } = useAuth();
  
  // Todos os refs primeiro
  const timeoutRef = useRef<number | null>(null);
  const previousDataRef = useRef<T>(data);
  const saveFnRef = useRef(saveFn);

  // Atualizar a ref da função de save quando ela mudar
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  // debouncedSave como callback
  const debouncedSave = useCallback(
    async (newData: T) => {
      if (!enabled || !user) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔄 Auto-salvando dados:', newData);
          await saveFnRef.current(newData);
          console.log('✅ Auto-save concluído com sucesso');
          previousDataRef.current = newData;
        } catch (error) {
          console.error('❌ Erro no auto-save:', error);
        }
      }, debounceMs);
    },
    [debounceMs, enabled, user]
  );

  // autoSave como callback
  const autoSave = useCallback(
    (newData: T) => {
      debouncedSave(newData);
    },
    [debouncedSave]
  );

  // Cleanup effect por último
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    cancelPendingSave: useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, [])
  };
} 