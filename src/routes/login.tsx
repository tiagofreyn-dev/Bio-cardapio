import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Mail, Lock, Store, Sparkles, UserPlus, LogIn } from "lucide-react";
import { useTenant } from "@/lib/tenant";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso — Bio-cardapio" },
      { name: "description", content: "Faça login para gerenciar sua loja ou criar um novo cardápio digital." }
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refreshTenant } = useTenant();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Conexão com banco de dados não configurada. Defina as variáveis de ambiente.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        // Fluxo de Cadastro de Nova Loja
        if (!storeName.trim()) {
          throw new Error("Por favor, insira o nome da sua loja.");
        }

        // 1. Cadastra o usuário no Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("Erro desconhecido ao criar usuário.");

        // Gerar slug amigável
        const baseSlug = storeName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove acentos
          .replace(/[^a-z0-9\s-]/g, "") // remove carac especiais
          .trim()
          .replace(/\s+/g, "-");

        // 2. Insere a nova loja na tabela
        const { error: storeError } = await supabase
          .from("lojas")
          .insert({
            user_id: signUpData.user.id,
            nome_da_loja: storeName.trim(),
            slug: baseSlug || `loja-${Math.random().toString(36).substring(2, 7)}`,
            cor_principal: "#EF4444", // Vermelho padrão inicial
            efeito_ativo: "nenhum",
          });

        if (storeError) {
          console.error("Erro ao criar perfil de loja:", storeError);
          // O usuário foi criado mas a loja falhou. Notificamos o usuário para tentar login.
          throw new Error("Usuário criado, mas houve um problema ao configurar sua loja. Tente fazer login.");
        }

        setSuccess("Sua loja foi criada com sucesso! Faça login para começar a personalizar.");
        setIsSignUp(false);
        setPassword("");
      } else {
        // Fluxo de Login Tradicional
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) throw signInError;
        if (!signInData.user) throw new Error("Erro de autenticação.");

        // Busca o slug da loja correspondente ao usuário logado
        const { data: store, error: storeError } = await supabase
          .from("lojas")
          .select("slug")
          .eq("user_id", signInData.user.id)
          .maybeSingle();

        setSuccess("Login bem-sucedido! Redirecionando...");
        
        // Atualiza os dados do context tenant em segundo plano (não-bloqueante)
        refreshTenant().catch(() => {});

        setTimeout(() => {
          if (store && store.slug) {
            navigate({ to: `/${store.slug}/admin` as any });
          } else {
            navigate({ to: "/" });
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Voltar para Home */}
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900/60 backdrop-blur border border-zinc-800 hover:border-primary/50 text-xs font-bold text-zinc-300 hover:text-white transition duration-300 active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Cardápio
      </Link>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 mb-2">
            <Store className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black tracking-tight" translate="no">
            Bio-cardápio
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {isSignUp
              ? "Crie sua loja em segundos e comece a vender com cardápio digital customizado."
              : "Acesse seu painel administrativo para personalizar cores, fotos e gerenciar produtos."}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 backdrop-blur-md ring-1 ring-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Nome da sua Loja</label>
                <div className="relative">
                  <Store className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Açaí do Carlos, Burguer Square"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/80 text-sm font-semibold text-white placeholder:text-zinc-600 border border-zinc-800/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-255"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/80 text-sm font-semibold text-white placeholder:text-zinc-600 border border-zinc-800/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-255"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-950/80 text-sm font-semibold text-white placeholder:text-zinc-600 border border-zinc-800/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition duration-255"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold bg-red-950/20 border border-red-500/20 p-3 rounded-xl text-center animate-shake">
                ⚠️ {error}
              </p>
            )}

            {success && (
              <p className="text-xs text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-center">
                ✨ {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-sm shadow-[0_4px_20px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.35)] disabled:opacity-50 transition duration-300 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" /> Criar Minha Loja
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Entrar no Painel
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-zinc-800/80"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-zinc-500">Ou</span>
            <div className="flex-grow border-t border-zinc-800/80"></div>
          </div>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="w-full h-11 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700/80 font-bold text-xs transition duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {isSignUp ? (
              <>Já tenho uma conta. Fazer Login</>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Não tem conta? Cadastrar Nova Loja
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
