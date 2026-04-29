import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa o cliente Admin para ignorar o RLS no servidor
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

    // 1. Busca os dados exatos do diagnóstico
    const { data: diagnosticoInput, error: fetchError } = await supabaseAdmin
      .from("diagnosticos_sono")
      .select("*")
      .eq("id", diagnosticoId)
      .single();

    if (fetchError || !diagnosticoInput) {
      return NextResponse.json({ error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    // 2. Prompt de Sistema (Contrato Rígido)
    const systemPrompt = `
Você é um processador de dados clínicos especializado em cronobiologia. 
Sua função é receber um JSON com hábitos de sono e retornar EXCLUSIVAMENTE um objeto JSON válido.

REGRAS DE FORMATAÇÃO:
1. Retorne apenas o JSON puro, sem markdown ou explicações.
2. A rotina deve ter de 6 a 8 itens, terminando no horário de "janela_horario".
3. IDs de Dicas Genéricas: 1 (Luz Azul), 2 (Cafeína), 3 (Quarto Fresco), 4 (4-7-8), 5 (Ritual), 6 (Body Scan).

SCHEMA DE SAÍDA:
{
  "geral": {
    "score_obtido": <integer>,
    "classificacao_ia": "<string>",
    "resumo_ia": "<string>"
  },
  "rotina": [
    { "ordem": <int>, "horario_inicio": "HH:MM", "duracao_minutos": <int>, "atividade": "<string>", "descricao": "<string>", "por_que": "<string>", "icone_nome": "<string>" }
  ],
  "riscos": [
    { "titulo_risco": "<string>", "texto_impacto": "<string>", "titulo_acao": "<string>", "texto_acao": "<string>" }
  ],
  "dicas_selecionadas": [<int>],
  "dicas_personalizadas": [
    { "titulo": "<string>", "descricao": "<string>", "icone_nome": "<string>" }
  ]
}
`;

    const promptCompleto = `${systemPrompt}\n\n<INPUT_USUARIO>\n${JSON.stringify(diagnosticoInput)}\n</INPUT_USUARIO>`;

    // 3. Chamada à IA
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const iaData = JSON.parse(result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim());

    // 4. Limpeza de dados antigos
    await Promise.all([
      supabaseAdmin.from("rotinas_pre_sono").delete().eq("usuario_id", usuarioId),
      supabaseAdmin.from("fatores_risco_detectados").delete().eq("usuario_id", usuarioId),
      supabaseAdmin.from("usuario_dicas").delete().eq("usuario_id", usuarioId),
      supabaseAdmin.from("dicas_personalizadas").delete().eq("usuario_id", usuarioId)
    ]);

    // 5. Atualização da tabela principal (Usando os nomes REAIS da sua tabela)
    const { error: updateError } = await supabaseAdmin
      .from("diagnosticos_sono")
      .update({
        score_obtido: Number(iaData.geral.score_obtido),
        classificacao_ia: String(iaData.geral.classificacao_ia),
        resumo_ia: String(iaData.geral.resumo_ia),
        processado_ia: true // Nome correto da coluna identificado no seu dump
      })
      .eq("id", diagnosticoId);

    if (updateError) throw new Error(`Erro no Update: ${updateError.message}`);

    // 6. Inserção dos dados detalhados
    if (iaData.rotina?.length > 0) {
      await supabaseAdmin.from("rotinas_pre_sono").insert(
        iaData.rotina.map((r: any) => ({ ...r, usuario_id: usuarioId, diagnostico_id: diagnosticoId }))
      );
    }

    if (iaData.riscos?.length > 0) {
      await supabaseAdmin.from("fatores_risco_detectados").insert(
        iaData.riscos.map((r: any) => ({ ...r, usuario_id: usuarioId, diagnostico_id: diagnosticoId }))
      );
    }

    if (iaData.dicas_selecionadas?.length > 0) {
      await supabaseAdmin.from("usuario_dicas").insert(
        iaData.dicas_selecionadas.map((id: number) => ({ dica_id: id, usuario_id: usuarioId }))
      );
    }

    if (iaData.dicas_personalizadas?.length > 0) {
      await supabaseAdmin.from("dicas_personalizadas").insert(
        iaData.dicas_personalizadas.map((d: any) => ({ ...d, usuario_id: usuarioId, diagnostico_id: diagnosticoId }))
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}