function GroupsTab({ lojaId }: { lojaId: string | null }) {
  const settings = useStorageSync(() => storage.getSettings());
  const [templates, setTemplates] = useState<ChoiceGroup[]>(settings?.choiceGroupTemplates || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.choiceGroupTemplates) {
      setTemplates(settings.choiceGroupTemplates);
    }
  }, [settings?.choiceGroupTemplates]);

  async function saveTemplates(newTemplates: ChoiceGroup[]) {
    if (!supabase || !lojaId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("lojas")
        .update({ choice_group_templates: newTemplates })
        .eq("id", lojaId);
      if (error) throw error;
      
      const newSettings = { ...settings, choiceGroupTemplates: newTemplates };
      storage.setSettings(newSettings as Settings);
      setTemplates(newTemplates);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar grupos. Verifique se você executou a migration SQL para adicionar a coluna 'choice_group_templates'.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6 max-w-4xl pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Grupos de Sabores e Adicionais</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Crie templates globais (ex: Ponto da Carne, Sabores de Pizza) para reutilizar em seus produtos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => {
            const newGroup: ChoiceGroup = { id: crypto.randomUUID(), name: "Novo Grupo", min_choices: 0, max_choices: 1, pricing_logic: "sum", options: [] };
            saveTemplates([...templates, newGroup]);
          }} className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition active:scale-95">
            + Novo Grupo Vazio
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <span className="text-[10px] uppercase font-black text-primary tracking-wider w-full">Magia: Templates Rápidos</span>
        <button onClick={() => {
          const sab: ChoiceGroup = { id: crypto.randomUUID(), name: "Sabores da Pizza", min_choices: 1, max_choices: 3, pricing_logic: "highest", options: [] };
          saveTemplates([...templates, sab]);
        }} className="text-[10px] font-bold px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30">🍕 Magia: Pizza</button>
        <button onClick={() => {
          const ponto: ChoiceGroup = { id: crypto.randomUUID(), name: "Ponto da Carne", min_choices: 1, max_choices: 1, pricing_logic: "sum", options: [{ id: crypto.randomUUID(), name: "Ao ponto", price: 0 }, { id: crypto.randomUUID(), name: "Bem passado", price: 0 }] };
          const extra: ChoiceGroup = { id: crypto.randomUUID(), name: "Turbinar Burger", min_choices: 0, max_choices: 10, pricing_logic: "sum", options: [{ id: crypto.randomUUID(), name: "Bacon Extra", price: 5 }] };
          saveTemplates([...templates, ponto, extra]);
        }} className="text-[10px] font-bold px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30">🍔 Magia: Burger</button>
        <button onClick={() => {
          const grats: ChoiceGroup = { id: crypto.randomUUID(), name: "Acompanhamentos Grátis", min_choices: 0, max_choices: 3, pricing_logic: "sum", options: [] };
          const pagos: ChoiceGroup = { id: crypto.randomUUID(), name: "Adicionais Pagos", min_choices: 0, max_choices: 10, pricing_logic: "sum", options: [] };
          saveTemplates([...templates, grats, pagos]);
        }} className="text-[10px] font-bold px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">🍧 Magia: Açaí</button>
      </div>

      <div className="space-y-4">
        {templates.length === 0 && (
          <div className="p-8 text-center text-zinc-500 italic bg-surface rounded-2xl ring-1 ring-border">Nenhum grupo configurado. Comece criando um vazio ou usando uma Magia acima.</div>
        )}
        {templates.map((group, gIdx) => (
          <div key={group.id} className="p-4 bg-surface ring-1 ring-border rounded-2xl space-y-4 relative">
            <div className="absolute top-4 right-4">
               <button onClick={() => {
                 if (confirm("Excluir este grupo excluirá as opções de todos os produtos que o utilizam. Continuar?")) {
                   saveTemplates(templates.filter(t => t.id !== group.id));
                 }
               }} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 mr-10">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-400 font-bold ml-1">Nome do Grupo</label>
                <input value={group.name} onChange={e => {
                  const ng = [...templates]; ng[gIdx].name = e.target.value; setTemplates(ng);
                }} onBlur={() => saveTemplates(templates)} className="w-full bg-zinc-950 ring-1 ring-border rounded-lg px-3 py-2 text-sm font-bold" placeholder="Ex: Sabores" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold ml-1">Mínimo de escolhas</label>
                <input type="number" min="0" value={group.min_choices} onChange={e => {
                  const ng = [...templates]; ng[gIdx].min_choices = parseInt(e.target.value)||0; setTemplates(ng);
                }} onBlur={() => saveTemplates(templates)} className="w-full bg-zinc-950 ring-1 ring-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold ml-1">Máximo de escolhas</label>
                <input type="number" min="1" value={group.max_choices} onChange={e => {
                  const ng = [...templates]; ng[gIdx].max_choices = parseInt(e.target.value)||1; setTemplates(ng);
                }} onBlur={() => saveTemplates(templates)} className="w-full bg-zinc-950 ring-1 ring-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold ml-1">Regra de Preço</label>
                <select value={group.pricing_logic} onChange={e => {
                  const ng = [...templates]; ng[gIdx].pricing_logic = e.target.value as any; saveTemplates(ng);
                }} className="w-full bg-zinc-950 ring-1 ring-border rounded-lg px-2 py-2 text-sm">
                  <option value="sum">Soma (Adicionais)</option>
                  <option value="highest">Maior Valor (Pizza)</option>
                  <option value="average">Média (Pizza)</option>
                </select>
              </div>
            </div>

            <div className="bg-zinc-900/50 p-3 rounded-xl ring-1 ring-border mt-4">
              <label className="text-xs font-bold text-zinc-300 mb-2 block">Opções disponíveis:</label>
              <div className="space-y-2">
                {group.options.map((opt, oIdx) => (
                  <div key={opt.id} className="flex gap-2 items-center">
                    <input value={opt.name} onChange={e => {
                      const ng = [...templates]; ng[gIdx].options[oIdx].name = e.target.value; setTemplates(ng);
                    }} onBlur={() => saveTemplates(templates)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm" placeholder="Nome (Ex: Calabresa)" />
                    <input type="number" step="0.01" value={opt.price} onChange={e => {
                      const ng = [...templates]; ng[gIdx].options[oIdx].price = parseFloat(e.target.value)||0; setTemplates(ng);
                    }} onBlur={() => saveTemplates(templates)} className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm" placeholder="R$ 0,00" />
                    <button onClick={() => {
                      const ng = [...templates]; ng[gIdx].options = ng[gIdx].options.filter((_, i) => i !== oIdx); saveTemplates(ng);
                    }} className="text-zinc-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => {
                  const ng = [...templates]; ng[gIdx].options.push({ id: crypto.randomUUID(), name: "", price: 0 }); saveTemplates(ng);
                }} className="text-xs bg-primary/10 text-primary font-bold px-3 py-2 rounded-lg hover:bg-primary/20 transition w-full mt-2 border border-primary/20">+ Adicionar Opção</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {saving && <p className="text-xs text-primary font-bold animate-pulse text-center">Salvando grupos na nuvem...</p>}
    </section>
  );
}
