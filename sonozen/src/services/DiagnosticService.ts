// src/services/DiagnosticService.ts
import { supabase } from "../lib/supabase";

export const DiagnosticService = {
  async getDiagnostics(userId: string, limit = 1) {
    return await supabase
      .from("diagnosticos_sono")
      .select("*")
      .eq("usuario_id", userId)
      .order("criado_em", { ascending: false })
      .limit(limit);
  },

  async getLatestProcessedDiagnostic(userId: string) {
    return await supabase
      .from("diagnosticos_sono")
      .select("*")
      .eq("usuario_id", userId)
      .eq("processado_ia", true)
      .order("criado_em", { ascending: false })
      .limit(1)
      .single();
  },

  async getRisks(userId: string, diagnosticoId?: number) {
    let query = supabase
      .from("fatores_risco_detectados")
      .select("*")
      .eq("usuario_id", userId);
      
    if (diagnosticoId) {
       query = query.eq("diagnostico_id", diagnosticoId);
    }
    
    return await query.order("criado_em", { ascending: true });
  },

  async getRoutines(userId: string) {
    return await supabase
      .from("rotinas_pre_sono")
      .select("*")
      .eq("usuario_id", userId)
      .order("ordem", { ascending: true });
  },

  async deleteDiagnostics(userId: string) {
    return await supabase
      .from("diagnosticos_sono")
      .delete()
      .eq("usuario_id", userId);
  },

  async saveDiagnosticAndProcess(userId: string, diagnosticoData: any) {
    // 1. Limpeza
    await this.deleteDiagnostics(userId);

    // 2. Salva o Formulário no Banco
    const { data: diagSalvo, error } = await supabase
      .from("diagnosticos_sono")
      .insert({ usuario_id: userId, ...diagnosticoData })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 3. Chama a Inteligência Artificial
    const respostaIA = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnosticoId: diagSalvo.id, usuarioId: userId }),
    });

    const resultadoIA = await respostaIA.json();
    if (!respostaIA.ok) throw new Error("Falha ao gerar IA: " + resultadoIA.error);

    return resultadoIA;
  }
};
