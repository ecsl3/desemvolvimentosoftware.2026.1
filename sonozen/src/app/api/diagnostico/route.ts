// src/app/api/diagnostico/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { diagnosticoId, usuarioId } = body;

    if (!diagnosticoId || !usuarioId) {
      return NextResponse.json({ error: "IDs ausentes." }, { status: 400 });
    }

    const { data: diagnosticoInput, error: fetchError } = await supabaseAdmin
      .from("diagnosticos_sono")
      .select("*")
      .eq("id", diagnosticoId)
      .single();

    if (fetchError || !diagnosticoInput) {
      return NextResponse.json({ error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    const systemPrompt = `
<INSTRUCOES_DE_SISTEMA>
Você é um processador de dados clínicos. Sua função é receber um JSON de input com hábitos de sono, aplicar regras de negócio de cronobiologia e retornar EXCLUSIVAMENTE um objeto JSON válido.

REGRAS DE FORMATAÇÃO ESTRITA (CRÍTICO PARA O SISTEMA):
1. O retorno DEVE ser um único objeto JSON válido.
2. NÃO adicione nenhum texto antes ou depois do JSON (sem saudações, sem explicações).
3. NÃO utilize blocos de código markdown (não inclua \`\`\`json ou \`\`\`). Retorne apenas o texto puro do JSON.
4. Escapar corretamente aspas duplas dentro dos textos.

REGRAS DE NEGÓCIO E LÓGICA:
1. Calculo de Horário: A "rotina" deve ter exatamente de 6 a 8 itens. O último item deve terminar no horário especificado em "janela_horario" do input. Retroceda os minutos em "horario_inicio" com base em "duracao_minutos".
2. Fatores de Risco: Liste exatamente os 3 maiores sabotadores do sono com base no input.
3. Dicas Genéricas e Personalizadas (CRÍTICO): 
   - Você DEVE selecionar OBRIGATORIAMENTE entre 2 a 4 IDs do "Catálogo de Dicas Genéricas" abaixo que cruzem com os problemas do usuário.
   - Você DEVE criar OBRIGATORIAMENTE entre 4 a 6 "Dicas Personalizadas" exclusivas, baseadas fortemente no campo "descricao_rotina_detalhada" e na rotina do usuário.
    - Você deve ter no total 8 dicas

CATÁLOGO DE DICAS GENÉRICAS (Para a chave "dicas_selecionadas"):
- ID 1: "Reduza a luz azul à noite" (Telas bloqueiam melatonina. Desligue eletrônicos 1h antes ou use filtro quente).
- ID 2: "Evite cafeína após as 14h" (Cafeína fica no sangue até 8h. Limite à parte da manhã).
- ID 3: "Mantenha o quarto fresco" (Temperatura entre 18°C e 22°C avisa ao corpo para descansar).
- ID 4: "Pratique a técnica 4-7-8" (Inspiração 4s, segura 7s, expiração 8s para relaxamento profundo).
- ID 5: "Crie um ritual consistente" (Mesmo horário para dormir/acordar, ajustando o relógio biológico).
- ID 6: "Body Scan Meditation" (Foco progressivo em relaxar cada grupo muscular).

SCHEMA DE SAÍDA OBRIGATÓRIO (RESPEITE OS LIMITES DE TAMANHO):
{
  "geral": {
    "score_obtido": <integer, 0 a 100>,
    "classificacao_ia": "<string, 2 a 5 palavras, ex: Alerta Moderado>",
    "resumo_ia": "<string, exatamente 2 a 3 frases, máximo 200 caracteres. Direto e clínico.>"
  },
  "rotina": [
    {
      "ordem": <integer, sequencial começando em 1>,
      "horario_inicio": "<string, formato HH:MM>",
      "duracao_minutos": <integer>,
      "atividade": "<string, máximo 6 palavras>",
      "descricao": "<string, 1 frase curta, máximo 100 caracteres. Ação clara.>",
      "por_que": "<string, 1 a 2 frases, máximo 120 caracteres. O motivo biológico.>",
      "icone_nome": "<string>"
    }
  ],
  "riscos": [
    {
      "titulo_risco": "<string, máximo 4 palavras>",
      "texto_impacto": "<string, máximo 120 caracteres. Como isso sabota o sono.>",
      "titulo_acao": "<string, máximo 4 palavras. Verbo de ação.>",
      "texto_acao": "<string, máximo 120 caracteres. O que fazer para resolver.>"
    }
  ],
  "dicas_selecionadas": [<integer, exatamente 3 ou 4 IDs do catálogo>],
  "dicas_personalizadas": [
    {
      "titulo": "<string, máximo 5 palavras>",
      "descricao": "<string, máximo 150 caracteres. Hiper-personalizada baseada no input do usuário.>",
      "icone_nome": "<string>"
    }
  ]
}
</INSTRUCOES_DE_SISTEMA>
`;

    const promptCompleto = `${systemPrompt}\n\n<INPUT_USUARIO>\n${JSON.stringify(diagnosticoInput, null, 2)}\n</INPUT_USUARIO>`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const iaData = JSON.parse(result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim());

    // 4. Limpeza das tabelas secundárias
    await Promise.all([
      supabaseAdmin.from("rotinas_pre_sono").delete().eq("usuario_id", usuarioId),
      supabaseAdmin.from("fatores_risco_detectados").delete().eq("usuario_id", usuarioId),
      supabaseAdmin.from("usuario_dicas").delete().eq("usuario_id", usuarioId)
    ]);

    // 5. ATUALIZAÇÃO DO DIAGNÓSTICO
    const { error: updateError } = await supabaseAdmin
      .from("diagnosticos_sono")
      .update({
        score_obtido: Number(iaData.geral.score_obtido) || 50,
        classificacao_ia: String(iaData.geral.classificacao_ia),
        resumo_ia: String(iaData.geral.resumo_ia),
        processado_ia: true
      })
      .eq("id", diagnosticoId);

    if (updateError) throw new Error(`Erro no Update: ${updateError.message}`);

    // 6. Inserções da Rotina (INTACTO)
    if (iaData.rotina?.length > 0) {
      await supabaseAdmin.from("rotinas_pre_sono").insert(
        iaData.rotina.map((r: any) => ({ ...r, usuario_id: usuarioId, diagnostico_id: diagnosticoId }))
      );
    }

    // 7. Inserções dos Fatores de Risco (INTACTO)
    if (iaData.riscos?.length > 0) {
      await supabaseAdmin.from("fatores_risco_detectados").insert(
        iaData.riscos.map((r: any) => ({ ...r, usuario_id: usuarioId, diagnostico_id: diagnosticoId }))
      );
    }

    // 8. Inserções das Dicas (NOVO: Cadastra na tabela dicas e vincula)
    if (iaData.dicas_selecionadas?.length > 0) {
      await supabaseAdmin.from("usuario_dicas").insert(
        iaData.dicas_selecionadas.map((id: number) => ({ dica_id: id, usuario_id: usuarioId }))
      );
    }

    if (iaData.dicas_personalizadas?.length > 0) {
      // Prepara o objeto para a tabela 'dicas'
      const dicasParaInserir = iaData.dicas_personalizadas.map((d: any) => ({
        titulo: d.titulo,
        descricao: d.descricao,
        icone_nome: d.icone_nome,
        categoria: "IA Sob Medida",
        is_generica: false
      }));

      // Insere na tabela 'dicas' e pede os IDs de volta
      const { data: dicasInseridas, error: erroDicas } = await supabaseAdmin
        .from("dicas")
        .insert(dicasParaInserir)
        .select('id');

      if (erroDicas) throw new Error(`Falha ao inserir dicas gerais: ${erroDicas.message}`);

      // Faz o match na tabela 'usuario_dicas'
      if (dicasInseridas && dicasInseridas.length > 0) {
        const vinculosPersonalizados = dicasInseridas.map((d: any) => ({
          dica_id: d.id,
          usuario_id: usuarioId
        }));
        await supabaseAdmin.from("usuario_dicas").insert(vinculosPersonalizados);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}