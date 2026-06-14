-- Cria uma tabela simples de perfis
create table perfis (
  id uuid references auth.users not null primary key,
  nome text,
  meta_sono integer default 8
);

-- Habilita o acesso de leitura para qualquer um (Sem segurança!)
alter table perfis enable row level security;
create policy "Qualquer um pode ler" on perfis for select using (true);
create policy "Qualquer um pode inserir" on perfis for insert with check (true);


create table historico (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pergunta text,
  resposta text,
  usuario_id uuid references auth.users(id) -- Liga ao usuário logado
);

-- Liberar geral (Sem segurança como pedido)
alter table historico enable row level security;
create policy "Acesso Total" on historico for all using (true) with check (true);

-- Criação da tabela de Dicas
CREATE TABLE dicas (
  id SERIAL PRIMARY KEY, -- Um número que cresce sozinho (1, 2, 3...)
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar a Segurança a Nível de Linha (RLS)
ALTER TABLE dicas ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário autenticado (logado) pode LER as dicas
CREATE POLICY "Dicas são visíveis para todos os usuários logados"
ON dicas FOR SELECT
TO authenticated
USING (true);

-- Inserir os dados iniciais do MVP
INSERT INTO dicas (categoria, titulo, descricao, icone_nome) VALUES
('Luz', 'Reduza a luz azul à noite', 'Telas de celulares e computadores emitem luz azul que bloqueia a produção de melatonina. Tente desligar os eletrônicos 1 hora antes de dormir ou use filtros de luz quente.', 'moon'),
('Alimentação', 'Evite cafeína após as 14h', 'A cafeína pode permanecer na sua corrente sanguínea por até 8 horas. Limite o café, chás pretos e refrigerantes para a parte da manhã.', 'coffee'),
('Ambiente', 'Mantenha o quarto fresco', 'A temperatura ideal para dormir costuma ser entre 18°C e 22°C. Um ambiente levemente mais frio avisa ao corpo que é hora de descansar.', 'thermometer'),
('Mental', 'Pratique a técnica 4-7-8', 'Inspire pelo nariz por 4 segundos, segure a respiração por 7 segundos e expire lentamente pela boca por 8. Repita 4 vezes para relaxar profundamente.', 'brain'),
('Rotina', 'Crie um ritual consistente', 'Vá para a cama e acorde no mesmo horário todos os dias, até nos fins de semana. Isso ajusta seu relógio biológico (ciclo circadiano).', 'routine'),
('Relaxamento', 'Body Scan Meditation', 'Deite-se e focalize sua atenção progressivamente em cada parte do corpo, dos pés à cabeça. Conscientemente relaxe cada grupo muscular. Leva 10-15 minutos e reduz a tensão significativamente.', 'wind');


-- Adiciona a coluna is_generica (por padrão, é falsa)
ALTER TABLE dicas ADD COLUMN is_generica BOOLEAN DEFAULT FALSE;

-- Atualiza as 6 dicas que já criamos para serem genéricas (verdadeiras)
UPDATE dicas SET is_generica = TRUE;


-- Criação da tabela que liga Usuários às suas Dicas personalizadas
CREATE TABLE usuario_dicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dica_id INTEGER REFERENCES dicas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Regra de Ouro: Evita que a IA adicione a MESMA dica duas vezes para a MESMA pessoa
  UNIQUE(usuario_id, dica_id) 
);

-- Ativar a Segurança a Nível de Linha (RLS)
ALTER TABLE usuario_dicas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem VER as dicas recomendadas para eles mesmos
CREATE POLICY "Ver próprias dicas"
ON usuario_dicas FOR SELECT
USING (auth.uid() = usuario_id);

-- Política: Permite a inserção de dicas para o próprio usuário (A IA usará isso)
CREATE POLICY "Inserir próprias dicas"
ON usuario_dicas FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Política: Permite que o usuário remova uma dica se não quiser mais segui-la
CREATE POLICY "Remover próprias dicas"
ON usuario_dicas FOR DELETE
USING (auth.uid() = usuario_id);

-- ==========================================
-- 1. DEFINIÇÃO DOS TIPOS (ENUMS) EM PORTUGUÊS
-- ==========================================

create type objetivo_sono as enum ('dormir_mais_rapido', 'melhorar_qualidade', 'regular_horarios', 'reduzir_ansiedade');
create type horario_deitar as enum ('antes_22h', 'entre_22h_00h', 'entre_00h_02h', 'apos_02h');
create type latencia_sono as enum ('ate_15min', '15_a_30min', '30_a_60min', 'mais_de_1h');
create type frequencia_despertar as enum ('nenhuma', '1_a_2_vezes', '3_a_4_vezes', 'perco_o_sono');
create type habito_cafeina as enum ('nao_consumo_manha', 'ate_15h', 'ate_18h', 'noite');
create type exposicao_telas as enum ('desligo_1h_antes', 'desligo_ao_deitar', 'uso_na_cama', 'durmo_com_tela');
create type humor_noturno as enum ('mente_calma', 'planejando_amanha', 'pensamentos_acelerados', 'muita_ansiedade');
create type qualidade_ambiente as enum ('ideal', 'aceitavel', 'desconfortavel', 'inadequado');
create type impacto_dia as enum ('disposto', 'cansaco_leve', 'exausto', 'sono_incontrolavel');

-- ==========================================
-- 2. TABELA PRINCIPAL: diagnosticos_sono
-- ==========================================

create table public.diagnosticos_sono (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references auth.users(id) on delete cascade not null,
  
  -- Perfil
  idade int not null,
  genero text not null,
  
  -- Respostas do Formulário
  objetivo_principal objetivo_sono not null,
  janela_horario horario_deitar not null,
  tempo_para_dormir latencia_sono not null,
  frequencia_despertares frequencia_despertar not null,
  consumo_cafeina habito_cafeina not null,
  uso_telas exposicao_telas not null,
  estado_mental humor_noturno not null,
  conforto_ambiente qualidade_ambiente not null,
  cansaco_diurno impacto_dia not null,
  impacto_qualidade_vida impacto_dia not null,
  
  -- Controle
  processado_ia boolean default false,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================

alter table public.diagnosticos_sono enable row level security;

-- Permitir que o usuário veja apenas seus próprios registros
create policy "Usuários podem ver próprios diagnósticos" 
on public.diagnosticos_sono for select 
using (auth.uid() = usuario_id);

-- Permitir que o usuário insira seus próprios registros
create policy "Usuários podem inserir próprios diagnósticos" 
on public.diagnosticos_sono for insert 
with check (auth.uid() = usuario_id);

-- Adicionando a 11ª pergunta: Descrição livre do dia
ALTER TABLE public.diagnosticos_sono 
ADD COLUMN descricao_rotina_detalhada TEXT;

-- Comentário para documentar o campo no banco
COMMENT ON COLUMN public.diagnosticos_sono.descricao_rotina_detalhada 
IS 'Pergunta opcional 11: Descrição livre do usuário sobre sua rotina ou dia para melhorar o diagnóstico da IA.';

-- ==========================================================
-- 1. TIPOS ENUM (Garantindo que existam para as colunas)
-- ==========================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'objetivo_sono') THEN
        create type objetivo_sono as enum ('dormir_mais_rapido', 'melhorar_qualidade', 'regular_horarios', 'reduzir_ansiedade');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'horario_deitar') THEN
        create type horario_deitar as enum ('antes_22h', 'entre_22h_00h', 'entre_00h_02h', 'apos_02h');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'latencia_sono') THEN
        create type latencia_sono as enum ('ate_15min', '15_a_30min', '30_a_60min', 'mais_de_1h');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'frequencia_despertar') THEN
        create type frequencia_despertar as enum ('nenhuma', '1_a_2_vezes', '3_a_4_vezes', 'perco_o_sono');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habito_cafeina') THEN
        create type habito_cafeina as enum ('nao_consumo_manha', 'ate_15h', 'ate_18h', 'noite');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exposicao_telas') THEN
        create type exposicao_telas as enum ('desligo_1h_antes', 'desligo_ao_deitar', 'uso_na_cama', 'durmo_com_tela');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'humor_noturno') THEN
        create type humor_noturno as enum ('mente_calma', 'planejando_amanha', 'pensamentos_acelerados', 'muita_ansiedade');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'qualidade_ambiente') THEN
        create type qualidade_ambiente as enum ('ideal', 'aceitavel', 'desconfortavel', 'inadequado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'impacto_dia') THEN
        create type impacto_dia as enum ('disposto', 'cansaco_leve', 'exausto', 'sono_incontrolavel');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_ia') THEN
        create type status_ia as enum ('pendente', 'processando', 'concluido', 'erro');
    END IF;
END $$;

-- ==========================================================
-- 2. TABELA: diagnosticos_sono (Entrada + Resumo Geral)
-- ==========================================================
-- Esta tabela armazena as 11 perguntas e o resumo do diagnóstico gerado pela IA.

CREATE TABLE IF NOT EXISTS public.diagnosticos_sono (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Inputs do Usuário (11 perguntas)
  idade INT NOT NULL,
  genero TEXT NOT NULL,
  objetivo_principal objetivo_sono NOT NULL,
  janela_horario horario_deitar NOT NULL,
  tempo_para_dormir latencia_sono NOT NULL,
  frequencia_despertares frequencia_despertar NOT NULL,
  consumo_cafeina habito_cafeina NOT NULL,
  uso_telas exposicao_telas NOT NULL,
  estado_mental humor_noturno NOT NULL,
  conforto_ambiente qualidade_ambiente NOT NULL,
  cansaco_diurno impacto_dia NOT NULL,
  impacto_qualidade_vida impacto_dia NOT NULL,
  descricao_rotina_detalhada TEXT, -- Pergunta 11 (Opcional)

  -- Output da IA (Geral)
  score_obtido INT,
  classificacao_ia TEXT,
  resumo_ia TEXT,
  status_processamento status_ia DEFAULT 'pendente',
  
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 3. TABELA: rotinas_pre_sono (Atividades Detalhadas)
-- ==========================================================
-- Cada atividade sugerida pela IA será uma linha aqui.

CREATE TABLE IF NOT EXISTS public.rotinas_pre_sono (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnostico_id uuid REFERENCES public.diagnosticos_sono(id) ON DELETE CASCADE,
  
  ordem INT NOT NULL,
  horario_inicio TIME, -- Ex: 21:00
  duracao_minutos INT NOT NULL,
  atividade TEXT NOT NULL,
  descricao TEXT,
  por_que TEXT,
  icone_nome TEXT,
  
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 4. TABELA: fatores_risco_detectados (Análise de Riscos)
-- ==========================================================
-- Cada risco identificado vira uma linha aqui.

CREATE TABLE IF NOT EXISTS public.fatores_risco_detectados (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnostico_id uuid REFERENCES public.diagnosticos_sono(id) ON DELETE CASCADE,
  
  titulo_risco TEXT NOT NULL,
  texto_impacto TEXT NOT NULL,
  titulo_acao TEXT NOT NULL,
  texto_acao TEXT NOT NULL,
  
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- 5. SEGURANÇA (RLS)
-- ==========================================================

ALTER TABLE public.diagnosticos_sono ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotinas_pre_sono ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatores_risco_detectados ENABLE ROW LEVEL SECURITY;

-- Políticas para diagnosticos_sono
CREATE POLICY "Acesso individual diagnósticos" ON public.diagnosticos_sono
FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para rotinas_pre_sono
CREATE POLICY "Acesso individual rotinas" ON public.rotinas_pre_sono
FOR ALL USING (auth.uid() = usuario_id);

-- Políticas para fatores_risco_detectados
CREATE POLICY "Acesso individual riscos" ON public.fatores_risco_detectados
FOR ALL USING (auth.uid() = usuario_id);

-- ==========================================================
-- 6. TRIGGER PARA ATUALIZADO_EM
-- ==========================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diagnostico_timestamp
BEFORE UPDATE ON public.diagnosticos_sono
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

NOTIFY pgrst, 'reload schema';
ALTER TABLE public.diagnosticos_sono
ADD COLUMN score_obtido INT,
ADD COLUMN classificacao_ia TEXT,
ADD COLUMN resumo_ia TEXT;


ALTER TABLE public.diagnosticos_sono 
ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- E já damos a marretada no cache por garantia!
NOTIFY pgrst, 'reload schema';








create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.usuarios (id, email) -- Garanta que a tabela "usuarios" existe e tem essas colunas
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer; -- O "security definer" é essencial aqui!









-- 1. Cria a tabela usuarios linkada com a tabela de autenticação
create table public.usuarios (
  id uuid references auth.users on delete cascade not null primary key,
  email text
);

-- 2. Ativa o RLS (Segurança)
alter table public.usuarios enable row level security;