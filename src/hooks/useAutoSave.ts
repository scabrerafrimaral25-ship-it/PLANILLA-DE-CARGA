import { useEffect, useRef } from 'react';
import { PalletData } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  MASTER_DATA: 'pallet_master_data',
  SEARCH_IDS: 'pallet_search_ids',
  SESSION_ID: 'pallet_session_id',
};

export const useAutoSave = (
  masterData: PalletData[],
  searchIds: string[]
) => {
  const sessionIdRef = useRef<string | null>(null);

  // Cargar datos al inicio
  useEffect(() => {
    loadData();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    if (masterData.length > 0) {
      saveData(masterData, searchIds);
    }
  }, [masterData, searchIds]);

  const loadData = async () => {
    if (isSupabaseConfigured()) {
      try {
        const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

        if (storedSessionId) {
          const { data: session } = await supabase!
            .from('loading_sessions')
            .select('id')
            .eq('id', storedSessionId)
            .maybeSingle();

          if (session) {
            sessionIdRef.current = session.id;
            return await loadFromSupabase(session.id);
          }
        }
      } catch (error) {
        // Silently fall back to localStorage
      }
    }

    return loadFromLocalStorage();
  };

  const loadFromSupabase = async (sessionId: string) => {
    try {
      const { data: pallets } = await supabase!
        .from('master_pallets')
        .select('*')
        .eq('session_id', sessionId);

      const { data: searches } = await supabase!
        .from('search_history')
        .select('pallet_ids')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        masterData: pallets?.map(p => ({
          containerId: p.container_id,
          palletId: p.pallet_id,
          quantity: p.quantity,
          boxes: p.boxes,
          weight: Number(p.weight),
          description: p.description,
          originalRow: p.original_row,
        })) || [],
        searchIds: searches?.pallet_ids || [],
      };
    } catch (error) {
      return loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const masterData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.MASTER_DATA) || '[]'
      );
      const searchIds = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SEARCH_IDS) || '[]'
      );
      return { masterData, searchIds };
    } catch (error) {
      console.error('Error cargando desde localStorage:', error);
      return { masterData: [], searchIds: [] };
    }
  };

  const saveData = async (masterData: PalletData[], searchIds: string[]) => {
    localStorage.setItem(STORAGE_KEYS.MASTER_DATA, JSON.stringify(masterData));
    localStorage.setItem(STORAGE_KEYS.SEARCH_IDS, JSON.stringify(searchIds));

    if (isSupabaseConfigured() && masterData.length > 0) {
      try {
        let sessionId = sessionIdRef.current;

        if (!sessionId) {
          const { data: newSession } = await supabase!
            .from('loading_sessions')
            .insert({ session_name: `Carga ${new Date().toLocaleDateString()}` })
            .select()
            .single();

          if (newSession) {
            sessionId = newSession.id;
            sessionIdRef.current = sessionId;
            localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
          }
        }

        if (sessionId) {
          await supabase!.from('master_pallets').delete().eq('session_id', sessionId);

          const palletsToInsert = masterData.map(p => ({
            session_id: sessionId,
            container_id: p.containerId,
            pallet_id: p.palletId,
            quantity: p.quantity,
            boxes: p.boxes,
            weight: p.weight,
            description: p.description,
            original_row: p.originalRow,
          }));

          await supabase!.from('master_pallets').insert(palletsToInsert);

          if (searchIds.length > 0) {
            await supabase!.from('search_history').insert({
              session_id: sessionId,
              pallet_ids: searchIds,
            });
          }
        }
      } catch (error) {
        // Silently continue with localStorage only
      }
    }
  };

  const clearData = async () => {
    localStorage.removeItem(STORAGE_KEYS.MASTER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_IDS);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);

    if (isSupabaseConfigured() && sessionIdRef.current) {
      try {
        await supabase!
          .from('loading_sessions')
          .delete()
          .eq('id', sessionIdRef.current);
      } catch (error) {
        // Silently continue
      }
    }

    sessionIdRef.current = null;
  };

  return { loadData, clearData };
};
