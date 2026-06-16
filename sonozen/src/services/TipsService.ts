// src/services/TipsService.ts
import { supabase } from "../lib/supabase";

export const TipsService = {
  async getUserGenericTips(userId: string) {
    return await supabase
      .from("usuario_dicas")
      .select(`dicas (id, categoria, titulo, descricao, icone_nome)`)
      .eq("usuario_id", userId);
  },

  async getUserPersonalizedTips(userId: string) {
    return await supabase
      .from("dicas_personalizadas")
      .select(`id, titulo, descricao, icone_nome`)
      .eq("usuario_id", userId);
  },

  async getDefaultTips() {
    return await supabase
      .from("dicas")
      .select("*")
      .in("id", [1, 2, 3, 4, 5, 6])
      .order("id", { ascending: true });
  }
};
