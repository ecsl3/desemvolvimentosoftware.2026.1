// src/services/RemindersService.ts
import { supabase } from "../lib/supabase";

export const RemindersService = {
  async getReminders(userId: string) {
    return await supabase
      .from("lembretes")
      .select("*")
      .eq("usuario_id", userId)
      .order("horario", { ascending: true });
  },

  async getActiveReminders(userId: string) {
    return await supabase
      .from("lembretes")
      .select("*")
      .eq("usuario_id", userId)
      .eq("ativo", true)
      .order("horario", { ascending: true });
  },

  async createReminder(data: any) {
    return await supabase
      .from("lembretes")
      .insert(data);
  },

  async toggleReminderActive(id: string, currentStatus: boolean) {
    return await supabase
      .from("lembretes")
      .update({ ativo: !currentStatus })
      .eq("id", id);
  },

  async deleteReminder(id: string) {
    return await supabase
      .from("lembretes")
      .delete()
      .eq("id", id);
  }
};
