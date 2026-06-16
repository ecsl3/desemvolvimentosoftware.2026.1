// src/services/ProfileService.ts
import { supabase } from "../lib/supabase";

export const ProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async getProfileName(userId: string) {
    const { data, error } = await supabase
      .from("perfis")
      .select("nome")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    return await supabase
      .from("perfis")
      .update(updates)
      .eq("id", userId);
  },

  async upsertProfile(profileData: any) {
    return await supabase
      .from("perfis")
      .upsert(profileData);
  }
};
