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
    const { usuarioId, promptUsuario } = body;

    if (!usuarioId || !promptUsuario) {
      return NextResponse.json({ error: "IDs ou prompt ausentes." }, { status: 400 });
    }

    const systemPrompt = `
<INSTRUCOES_DE_SISTEMA>
Você é um assistente especialista em criação de hábitos e gestão de tempo. O usuário quer criar lembretes diários para melhorar a rotina dele.
Sua função é ler o que o usuário quer e devolver uma lista de lembretes adequados.

REGRAS DE FORMATAÇÃO ESTRITA (CRÍTICO PARA O SISTEMA):
1. O retorno DEVE ser um único objeto JSON válido.
2. NÃO adicione nenhum texto antes ou depois do JSON.
3. NÃO utilize blocos de código markdown (não inclua \`\`\`json ou \`\`\`). Retorne apenas o texto puro do JSON.

SCHEMA DE SAÍDA OBRIGATÓRIO:
{
  "lembretes": [
    {
      "titulo": "<string, título curto do lembrete, max 4 palavras>",
      "horario": "<string, formato HH:MM>"
    }
  ]
}

Se o usuário não especificar horários, deduza horários lógicos. Exemplo: "dormir cedo" -> 22:00, "beber água" -> crie 3 a 4 lembretes espaçados ao longo do dia.
Retorne no máximo 6 lembretes.
</INSTRUCOES_DE_SISTEMA>
`;

    const promptCompleto = `${systemPrompt}\n\n<INPUT_USUARIO>\n${promptUsuario}\n</INPUT_USUARIO>`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const iaData = JSON.parse(result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim());

    if (iaData.lembretes && iaData.lembretes.length > 0) {
      const lembretesParaInserir = iaData.lembretes.map((l: any) => ({
        usuario_id: usuarioId,
        titulo: l.titulo,
        horario: l.horario,
        ativo: true
      }));

      const { error: erroInsert } = await supabaseAdmin
        .from("lembretes")
        .insert(lembretesParaInserir);

      if (erroInsert) throw new Error(`Falha ao inserir lembretes: ${erroInsert.message}`);
    }

    return NextResponse.json({ success: true, lembretes: iaData.lembretes });

  } catch (error: any) {
    console.error("Erro na API de Lembretes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
