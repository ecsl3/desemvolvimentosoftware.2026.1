// src/components/DiagnosticForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowRight } from "lucide-react";

// Definimos as propriedades que este formulário pode receber
interface DiagnosticFormProps {
  onSuccess?: () => void; // Função opcional para avisar a página pai que terminou
}

export default function DiagnosticForm({ onSuccess }: DiagnosticFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados dos inputs
  const [idade, setIdade] = useState<number | "">("");
  const [genero, setGenero] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [horario, setHorario] = useState("");
  const [latencia, setLatencia] = useState("");
  const [fragmentacao, setFragmentacao] = useState("");
  const [cafeina, setCafeina] = useState("");
  const [telas, setTelas] = useState("");
  const [mental, setMental] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [sonolencia, setSonolencia] = useState("");
  const [cansaco, setCansaco] = useState("");
  const [descricaoLivre, setDescricaoLivre] = useState("");

  const totalSteps = 12;

  const canAdvance = () => {
    switch (currentStep) {
      case 0: return idade !== "" && genero !== "";
      case 1: return objetivo !== "";
      case 2: return horario !== "";
      case 3: return latencia !== "";
      case 4: return fragmentacao !== "";
      case 5: return cafeina !== "";
      case 6: return telas !== "";
      case 7: return mental !== "";
      case 8: return sonolencia !== "";
      case 9: return ambiente !== "";
      case 10: return cansaco !== "";
      case 11: return true; 
      default: return false;
    }
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (canAdvance() && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep !== totalSteps - 1) {
      e.preventDefault();
      handleNext();
    }
  };

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Você precisa estar logado para fazer o diagnóstico.");

      // 1. Limpeza
      await supabase.from("diagnosticos_sono").delete().eq("usuario_id", user.id);

      // 2. Salva o Formulário no Banco
      const diagnosticoData = {
        usuario_id: user.id,
        idade: Number(idade),
        genero: genero,
        objetivo_principal: objetivo,
        janela_horario: horario,
        tempo_para_dormir: latencia,
        frequencia_despertares: fragmentacao,
        consumo_cafeina: cafeina,
        uso_telas: telas,
        estado_mental: mental,
        conforto_ambiente: ambiente,
        cansaco_diurno: sonolencia,
        impacto_qualidade_vida: cansaco,
        descricao_rotina_detalhada: descricaoLivre || null
      };

      const { data: diagSalvo, error } = await supabase
        .from("diagnosticos_sono")
        .insert(diagnosticoData)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // 3. Chama a Inteligência Artificial
      const respostaIA = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosticoId: diagSalvo.id, usuarioId: user.id }),
      });

      const resultadoIA = await respostaIA.json();

      if (!respostaIA.ok) throw new Error("Falha ao gerar IA: " + resultadoIA.error);

      // Se passou uma função onSuccess (para recarregar a tela atual), executa ela
      if (onSuccess) {
          onSuccess();
      } else {
          router.push("/home");
      }

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setErrorMessage(error.message || "Erro desconhecido ao tentar conectar com a IA.");
    } finally {
      setLoading(false);
    }
  }

  const OptionButton = ({ label, value, state, setState }: { label: string, value: string, state: string, setState: (v: string) => void }) => (
    <button
      type="button"
      onClick={() => setState(value)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        state === value
          ? "border-blue-500 bg-blue-900/20 text-blue-400 font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          : "border-gray-800 bg-gray-900 hover:border-gray-700 text-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const LiteraturaCard = ({ texto }: { texto: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="mt-6 border border-blue-900/50 rounded-xl overflow-hidden transition-all duration-300">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex items-center justify-between bg-blue-950/20 hover:bg-blue-950/40 text-blue-300 text-sm font-medium transition-colors focus:outline-none">
          <span className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-blue-300" /> O que a ciência diz?</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
        </button>
        {isOpen && <div className="p-4 bg-blue-950/10 text-sm text-blue-200 border-t border-blue-900/50 leading-relaxed animate-in slide-in-from-top-2 duration-200">{texto}</div>}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Diagnóstico de Sono</h2>
        <p className="text-gray-400 text-sm">Suas respostas guiam a IA na criação da sua rotina ideal.</p>
      </div>
      
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
      </div>
      <p className="text-xs text-gray-500">{currentStep + 1} de {totalSteps}</p>

      <div className="flex-1 flex flex-col mt-8">
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* --- BLOCO DAS PERGUNTAS (1 A 11) --- */}
          {currentStep === 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Dados Pessoais</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Qual a sua idade?</label>
                  <input type="number" required value={idade} onChange={e => setIdade(Number(e.target.value))} onKeyDown={handleKeyDown} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-white" placeholder="Ex: 25" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Com qual gênero você se identifica?</label>
                  <select required value={genero} onChange={e => setGenero(e.target.value)} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-white appearance-none">
                    <option value="" disabled>Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não responder / Outro">Prefiro não responder / Outro</option>
                  </select>
                </div>
              </div>
              <LiteraturaCard texto="A arquitetura do sono muda com a idade. O gênero influencia devido a flutuações hormonais que afetam o ritmo circadiano." />
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Objetivo: Qual a sua principal meta com o SonoZen AI?</h3>
              <div className="grid gap-3">
                <OptionButton label="Dormir mais rápido" value="dormir_mais_rapido" state={objetivo} setState={setObjetivo} />
                <OptionButton label="Melhorar qualidade do sono" value="melhorar_qualidade" state={objetivo} setState={setObjetivo} />
                <OptionButton label="Regular horários" value="regular_horarios" state={objetivo} setState={setObjetivo} />
                <OptionButton label="Reduzir ansiedade noturna" value="reduzir_ansiedade" state={objetivo} setState={setObjetivo} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Cronotipo: A que horas você costuma ir para a cama?</h3>
              <div className="grid gap-3">
                <OptionButton label="Antes das 22:00" value="antes_22h" state={horario} setState={setHorario} />
                <OptionButton label="Entre 22:00 e 00:00" value="entre_22h_00h" state={horario} setState={setHorario} />
                <OptionButton label="Entre 00:00 e 02:00" value="entre_00h_02h" state={horario} setState={setHorario} />
                <OptionButton label="Após as 02:00" value="apos_02h" state={horario} setState={setHorario} />
              </div>
              <LiteraturaCard texto="Avalia o alinhamento com o ciclo de luz/escuro. Ir dormir após as 02:00 pode indicar 'jet lag social', comum em estudantes." />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Latência: Quanto tempo leva para dormir após apagar as luzes?</h3>
              <div className="grid gap-3">
                <OptionButton label="Até 15 minutos (Excelente)" value="ate_15min" state={latencia} setState={setLatencia} />
                <OptionButton label="15 a 30 minutos (Normal)" value="15_a_30min" state={latencia} setState={setLatencia} />
                <OptionButton label="30 a 60 minutos (Latência alta)" value="30_a_60min" state={latencia} setState={setLatencia} />
                <OptionButton label="Mais de 1 hora (Indicativo de insônia)" value="mais_de_1h" state={latencia} setState={setLatencia} />
              </div>
              <LiteraturaCard texto="A latência ideal é entre 10 e 20 minutos. Mais de 30 minutos é um critério clínico para diagnóstico de insônia inicial." />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Fragmentação: Quantas vezes você acorda durante a noite?</h3>
              <div className="grid gap-3">
                <OptionButton label="Nenhuma vez" value="nenhuma" state={fragmentacao} setState={setFragmentacao} />
                <OptionButton label="1 a 2 vezes (Leve)" value="1_a_2_vezes" state={fragmentacao} setState={setFragmentacao} />
                <OptionButton label="3 a 4 vezes (Moderado)" value="3_a_4_vezes" state={fragmentacao} setState={setFragmentacao} />
                <OptionButton label="Acordo e não consigo voltar a dormir (Grave)" value="perco_o_sono" state={fragmentacao} setState={setFragmentacao} />
              </div>
              <LiteraturaCard texto="Despertares frequentes impedem o corpo de completar os ciclos de sono REM e profundo, essenciais para a restauração física e cognitiva." />
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Estimulantes: Quando foi seu último consumo de cafeína?</h3>
              <div className="grid gap-3">
                <OptionButton label="Não consumo ou apenas pela manhã" value="nao_consumo_manha" state={cafeina} setState={setCafeina} />
                <OptionButton label="Até as 15:00" value="ate_15h" state={cafeina} setState={setCafeina} />
                <OptionButton label="Até as 18:00" value="ate_18h" state={cafeina} setState={setCafeina} />
                <OptionButton label="Perto da hora de dormir" value="noite" state={cafeina} setState={setCafeina} />
              </div>
              <LiteraturaCard texto="A cafeína tem meia-vida de 5 a 6 horas. Consumo após as 16h bloqueia receptores de adenosina, impedindo a pressão de sono natural." />
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Luz Azul: Uso de telas nos 30 minutos antes de deitar?</h3>
              <div className="grid gap-3">
                <OptionButton label="Não utilizo (Detox digital)" value="desligo_1h_antes" state={telas} setState={setTelas} />
                <OptionButton label="Uso apenas para tarefas rápidas" value="desligo_ao_deitar" state={telas} setState={setTelas} />
                <OptionButton label="Uso ativamente (Redes sociais/Jogos)" value="uso_na_cama" state={telas} setState={setTelas} />
                <OptionButton label="Adormeço com a TV ou celular ligado" value="durmo_com_tela" state={telas} setState={setTelas} />
              </div>
              <LiteraturaCard texto="A luz azul emitida pelas telas inibe a produção de melatonina, 'enganando' o cérebro para que ele ache que ainda é dia." />
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Estado Mental: Ao deitar, como são seus pensamentos?</h3>
              <div className="grid gap-3">
                <OptionButton label="Mente calma e relaxada" value="mente_calma" state={mental} setState={setMental} />
                <OptionButton label="Pensamentos leves sobre o dia" value="planejando_amanha" state={mental} setState={setMental} />
                <OptionButton label="Planejamento ansioso do amanhã" value="pensamentos_acelerados" state={mental} setState={setMental} />
                <OptionButton label="Preocupações que não desligam" value="muita_ansiedade" state={mental} setState={setMental} />
              </div>
              <LiteraturaCard texto="A hiperestimulação cognitiva é uma das maiores causas de insônia. Se o cérebro está resolvendo problemas, ele mantém o cortisol alto." />
            </div>
          )}

          {currentStep === 8 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Sonolência Diurna: Como você se sente durante suas atividades?</h3>
              <div className="grid gap-3">
                <OptionButton label="Disposto e alerta" value="disposto" state={sonolencia} setState={setSonolencia} />
                <OptionButton label="Cansaço leve em momentos parados" value="cansaco_leve" state={sonolencia} setState={setSonolencia} />
                <OptionButton label="Muita sonolência e falta de foco" value="exausto" state={sonolencia} setState={setSonolencia} />
                <OptionButton label="Cochilos involuntários durante o dia" value="sono_incontrolavel" state={sonolencia} setState={setSonolencia} />
              </div>
              <LiteraturaCard texto="Mede o impacto do sono na vida real. Um score alto indica distúrbios como apneia do sono ou má eficiência respiratória noturna." />
            </div>
          )}

          {currentStep === 9 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Ambiente Sensorial: Como você avalia o local onde dorme?</h3>
              <div className="grid gap-3">
                <OptionButton label="Ambiente perfeito (escuro, frio e silencioso)" value="ideal" state={ambiente} setState={setAmbiente} />
                <OptionButton label="Pequenos incômodos ocasionais" value="aceitavel" state={ambiente} setState={setAmbiente} />
                <OptionButton label="Ambiente inadequado (barulhento ou claro)" value="desconfortavel" state={ambiente} setState={setAmbiente} />
                <OptionButton label="Muito desconfortável (calor/ruído)" value="inadequado" state={ambiente} setState={setAmbiente} />
              </div>
              <LiteraturaCard texto="Ruídos e luzes fragmentam o sono mesmo que você não chegue a acordar totalmente (microdespertares)." />
            </div>
          )}

          {currentStep === 10 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Nível de Cansaço Diurno: Como você se sente durante o dia?</h3>
              <div className="grid gap-3">
                <OptionButton label="Disposto e alerta o dia todo" value="disposto" state={cansaco} setState={setCansaco} />
                <OptionButton label="Cansaço leve no fim da tarde" value="cansaco_leve" state={cansaco} setState={setCansaco} />
                <OptionButton label="Exausto e sem produtividade" value="exausto" state={cansaco} setState={setCansaco} />
                <OptionButton label="Com sono incontrolável (cochilos)" value="sono_incontrolavel" state={cansaco} setState={setCansaco} />
              </div>
              <LiteraturaCard texto="A percepção de prejuízo funcional durante o dia é um dos critérios fundamentais para o diagnóstico clínico de insônia." />
            </div>
          )}

          {currentStep === 11 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Observações: Algo mais que devamos saber? (Opcional)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Sinta-se à vontade para descrever a sua rotina com mais detalhes. A IA usará este texto para personalizar ainda mais o seu diagnóstico.
              </p>
              <textarea 
                value={descricaoLivre}
                onChange={e => setDescricaoLivre(e.target.value)}
                placeholder="Ex: Trabalho de plantão algumas vezes por semana e nos outros dias tento dormir às 23h..."
                className="w-full p-4 h-48 resize-none bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none transition text-white"
              ></textarea>
            </div>
          )}
          {/* --- FIM DO BLOCO DE PERGUNTAS --- */}
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-900/40 border border-red-500 rounded-xl text-red-200 text-sm">
            <strong>Erro:</strong> {errorMessage}
          </div>
        )}

        <div className="pt-8 mt-4 border-t border-gray-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className={`px-4 py-2 text-sm font-medium transition ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-white"}`}
          >
            ← Voltar
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Avançar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {loading ? "Processando IA..." : (
                <>
                  Gerar diagnóstico
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}