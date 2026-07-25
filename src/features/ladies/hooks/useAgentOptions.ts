import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type AgentOption = { id: string; nama_agent: string };

/** Daftar agent untuk dropdown pemilihan agent di form Ladies (Create & Detail). */
export function useAgentOptions() {
  const [agents, setAgents] = useState<AgentOption[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      const { data } = await supabase.from('agent').select('id, nama_agent');
      setAgents(data || []);
    };

    loadAgents();
  }, []);

  return agents;
}
