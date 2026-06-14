-- ==========================================================
-- SCRIPT DE CRIAÇÃO DA TABELA DE LEMBRETES
-- Execute este script no painel SQL do Supabase.
-- ==========================================================

CREATE TABLE public.lembretes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  horario time NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone default timezone('utc'::text, now()),
  atualizado_em timestamp with time zone default timezone('utc'::text, now())
);

-- Ativar RLS
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Política para que o usuário veja apenas os seus lembretes
CREATE POLICY "Usuários podem ver próprios lembretes" 
ON public.lembretes FOR SELECT 
USING (auth.uid() = usuario_id);

-- Política para que o usuário insira seus próprios lembretes
CREATE POLICY "Usuários podem inserir próprios lembretes" 
ON public.lembretes FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

-- Política para que o usuário atualize seus próprios lembretes
CREATE POLICY "Usuários podem atualizar próprios lembretes" 
ON public.lembretes FOR UPDATE 
USING (auth.uid() = usuario_id);

-- Política para que o usuário delete seus próprios lembretes
CREATE POLICY "Usuários podem deletar próprios lembretes" 
ON public.lembretes FOR DELETE 
USING (auth.uid() = usuario_id);

-- Trigger para manter atualizado_em em sincronia (já existe a função update_timestamp se você rodou o scripts.sql anterior)
CREATE TRIGGER update_lembretes_timestamp
BEFORE UPDATE ON public.lembretes
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Marretar o cache do PostgREST
NOTIFY pgrst, 'reload schema';
