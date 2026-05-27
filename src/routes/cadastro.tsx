import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { brl } from "@/lib/format";
import { ArrowLeft, User, Store, Palette, CheckCircle, Eye } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Criar Cardápio Digital — SaaS Onboarding" }] }),
  component: CadastroPage,
});

const PALETTES = [
  { name: "Vermelho", hex: "#EF4444", bg: "bg-red-500" },
  { name: "Azul", hex: "#3B82F6", bg: "bg-blue-500" },
  { name: "Verde", hex: "#10B981", bg: "bg-green-500" },
  { name: "Roxo", hex: "#8B5CF6", bg: "bg-purple-500" },
  { name: "Laranja", hex: "#F59E0B", bg: "bg-amber-500" },
];

function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Passo 1: Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [createdLojaId, setCreatedLojaId] = useState<string | null>(null);

  // Passo 2: Dados Comerciais
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Lanchonete");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState("5.00");
  const [chavePix, setChavePix] = useState("");
  const [titularPix, setTitularPix] = useState("");

  // Passo 3: Visual
  const [selectedColor, setSelectedColor] = useState("Vermelho");

  // Step 1 Submit: Cadastrar Usuário e Criar Loja Draft
  async function handleSubmitStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Conexão do Supabase não configurada no cliente.");
      }

      // 1. SignUp no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("Erro ao registrar o usuário. Verifique suas credenciais.");
      }

      const userId = authData.user.id;
      const slug = `loja-${Math.random().toString(36).substring(2, 8)}`;

      // 2. Criar registro rascunho na tabela lojas
      const { data: storeData, error: storeError } = await supabase
        .from("lojas")
        .insert({
          user_id: userId,
          nome: "Meu Novo Comércio",
          slug: slug,
          tipo: "Outros",
          cor_tema: "Vermelho",
          status_assinatura: "pendente",
        })
        .select()
        .single();

      if (storeError) throw storeError;

      setCreatedUserId(userId);
      setCreatedLojaId(storeData.id);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 Submit: Atualizar Dados da Loja
  async function handleSubmitStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !createdLojaId) return;
    setLoading(true);
    setError("");

    try {
      if (!supabase) throw new Error("Supabase indisponível.");

      const generatedSlug = nome
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]+/g, "-") // Troca espaços/caracteres por hifens
        .replace(/(^-|-$)/g, ""); // Limpa hifens nas pontas

      // Verificar se já existe slug
      const { data: existingLoja } = await supabase
        .from("lojas")
        .select("id")
        .eq("slug", generatedSlug)
        .neq("id", createdLojaId)
        .maybeSingle();

      const finalSlug = existingLoja 
        ? `${generatedSlug}-${Math.floor(Math.random() * 1000)}` 
        : generatedSlug;

      const { error: updateError } = await supabase
        .from("lojas")
        .update({
          nome: nome.trim(),
          slug: finalSlug,
          tipo: tipo,
          whatsapp: whatsapp.trim().replace(/\D/g, ""),
          endereco: endereco.trim(),
          taxa_entrega: parseFloat(taxaEntrega) || 0,
          chave_pix: chavePix.trim(),
          titular_pix: titularPix.trim(),
        })
        .eq("id", createdLojaId);

      if (updateError) throw updateError;
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao salvar dados comerciais.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 Submit: Salvar Cor e Concluir
  async function handleFinish() {
    if (!createdLojaId) return;
    setLoading(true);
    setError("");

    try {
      if (!supabase) throw new Error("Supabase indisponível.");

      const { error: updateError } = await supabase
        .from("lojas")
        .update({
          cor_tema: selectedColor,
        })
        .eq("id", createdLojaId);

      if (updateError) throw updateError;

      // Armazenar sessão rápida para pular login no admin temporariamente
      sessionStorage.setItem("insano.admin.auth", "true");
      sessionStorage.setItem("insano.admin.lojaId", createdLojaId);
      
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao configurar identidade visual.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full h-12 px-4 rounded-xl bg-zinc-950 text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-primary outline-none text-sm transition-all duration-200";
  const labelCls = "block space-y-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md text-center mb-6 space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Crie seu Cardápio</h1>
        <p className="text-sm text-zinc-400">Leve o seu comércio para o ambiente digital em poucos cliques.</p>
      </div>

      {/* Container Principal */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-zinc-900 ring-1 ring-zinc-800 shadow-2xl relative overflow-hidden">
        
        {/* Barra de Progresso Visual */}
        {step < 4 && (
          <div className="flex gap-2 mb-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-zinc-800"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-primary" : "bg-zinc-800"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? "bg-primary" : "bg-zinc-800"}`} />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-xs font-semibold text-red-400 text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* PASSO 1: DADOS DE USUÁRIO */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-lg text-white">Passo 1: Criar Conta</h3>
            </div>

            <label className={labelCls}>
              <span>Endereço de E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className={inputCls}
                required
              />
            </label>

            <label className={labelCls}>
              <span>Senha de Acesso</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                className={inputCls}
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-black text-sm active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Criando conta..." : "Criar Conta & Prosseguir"}
            </button>
          </form>
        )}

        {/* PASSO 2: DADOS COMERCIAIS */}
        {step === 2 && (
          <form onSubmit={handleSubmitStep2} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-lg text-white">Passo 2: Dados do Comércio</h3>
            </div>

            <label className={labelCls}>
              <span>Nome da Loja</span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Pizza Gourmet, Açaí Mix"
                className={inputCls}
                required
              />
            </label>

            <label className={labelCls}>
              <span>Tipo de Comércio</span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={inputCls}
              >
                <option value="Lanchonete">🍔 Lanchonete / Hamburgueria</option>
                <option value="Pizzaria">🍕 Pizzaria</option>
                <option value="Açaí / Sorvetes">🍨 Doceria / Açaí / Sorvetes</option>
                <option value="Japonesa">🍣 Culinária Japonesa</option>
                <option value="Outros">🏪 Outro Tipo de Comércio</option>
              </select>
            </label>

            <label className={labelCls}>
              <span>WhatsApp Comercial</span>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="DDD + Número (Ex: 35999999999)"
                className={inputCls}
                required
              />
            </label>

            <label className={labelCls}>
              <span>Endereço Comercial</span>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Número - Bairro"
                className={inputCls}
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={labelCls}>
                <span>Chave Pix</span>
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CNPJ, Celular ou CPF"
                  className={inputCls}
                />
              </label>

              <label className={labelCls}>
                <span>Titular da Chave Pix</span>
                <input
                  type="text"
                  value={titularPix}
                  onChange={(e) => setTitularPix(e.target.value)}
                  placeholder="Nome do Titular"
                  className={inputCls}
                />
              </label>
            </div>

            <label className={labelCls}>
              <span>Taxa de Frete Padrão (R$)</span>
              <input
                type="number"
                step="0.01"
                value={taxaEntrega}
                onChange={(e) => setTaxaEntrega(e.target.value)}
                placeholder="5.00"
                className={inputCls}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-black text-sm active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? "Salvando dados..." : "Salvar & Avançar"}
            </button>
          </form>
        )}

        {/* PASSO 3: DESIGN VISUAL */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-lg text-white">Passo 3: Estilo Visual</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Escolha a cor predominante do seu cardápio. Ela será injetada como cor principal nas interações, botões e destaques.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {PALETTES.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isSelected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${color.bg} shadow-md`} />
                      <span className="text-sm font-bold text-white">{color.name}</span>
                    </div>
                    {isSelected && <span className="text-xs text-primary font-black">Selecionado</span>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="w-full h-12 mt-4 rounded-xl bg-primary text-primary-foreground font-black text-sm active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? "Finalizando..." : "Finalizar Onboarding 🚀"}
            </button>
          </div>
        )}

        {/* PASSO 4: CONCLUÍDO */}
        {step === 4 && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Cardápio Pronto!</h3>
              <p className="text-xs text-zinc-400">Tudo foi configurado com sucesso no nosso ecossistema SaaS.</p>
            </div>
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed text-left space-y-2">
              <span className="font-extrabold text-white block">🚀 Proximidades:</span>
              <p>O link do seu cardápio foi gerado sob status <span className="font-bold text-amber-500">pendente</span>.</p>
              <p>Acesse o painel administrativo agora para adicionar produtos, testar seu cardápio no visualizador e ativar a publicação oficial!</p>
            </div>
            <button
              onClick={() => navigate({ to: "/admin" })}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-[0_5px_20px_rgba(239,68,68,0.3)] transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Entrar no Meu Painel Admin <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
