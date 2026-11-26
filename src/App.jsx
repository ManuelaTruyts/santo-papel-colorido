import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mllycuiddrguibgxcxcoc.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PIN = "santo2026";
const BUCKET_PRODUTOS = "produtos";

const STATUS_PEDIDO = [
  "Aguardando Pagamento",
  "Pagamento Aprovado",
  "Em Produção",
  "Enviado",
  "Entregue",
];

const DEFAULT_TITULO_BLOCO = "Personalize seu item";
const DEFAULT_TITULO_VAR_1 = "Quantidade referente";
const DEFAULT_TITULO_VAR_2 = "Cor";
const DEFAULT_TITULO_VAR_3 = "Tamanho";

const DEFAULT_OPCOES_VAR_1 =
  "10 unidades, 20 unidades, 30 unidades, 50 unidades";
const DEFAULT_OPCOES_VAR_2 =
  "Azul / Creme, Terracota / Dourado, Rosa Pastel, Verde Sálvia";
const DEFAULT_OPCOES_VAR_3 = "Pequeno, Médio, Grande";

function formatBRL(valor) {
  const num = Number(valor || 0);
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseCsvOptions(texto) {
  if (!texto) return [];
  return String(texto)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function gerarCodigoPedido() {
  const sufixo = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SPC-${Date.now().toString().slice(-5)}-${sufixo}`;
}

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("vitrine");
  const [painelAba, setPainelAba] = useState("categorias");
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [erroPin, setErroPin] = useState("");

  const [toast, setToast] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [configLoja, setConfigLoja] = useState({
    id: 1,
    whatsapp: "",
    frete_fixo: 15,
    frete_gratis_acima_de: 150,
  });

  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [buscaProduto, setBuscaProduto] = useState("");

  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  const [formProduto, setFormProduto] = useState({
    nome: "",
    preco: "",
    categoria_id: "",
    prazo_producao: "3 dias úteis",
    descricao: "",
    foto_url: "",
    tem_variacoes: true,
    titulo_variacoes: DEFAULT_TITULO_BLOCO,
    titulo_var_1: DEFAULT_TITULO_VAR_1,
    opcoes_var_1: DEFAULT_OPCOES_VAR_1,
    titulo_var_2: DEFAULT_TITULO_VAR_2,
    opcoes_var_2: DEFAULT_OPCOES_VAR_2,
    titulo_var_3: DEFAULT_TITULO_VAR_3,
    opcoes_var_3: DEFAULT_OPCOES_VAR_3,
  });
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  const [selecoesVitrine, setSelecoesVitrine] = useState({});
  const [sacola, setSacola] = useState([]);
  const [sacolaAberta, setSacolaAberta] = useState(false);

  const [clienteNome, setClienteNome] = useState("");
  const [clienteWhatsapp, setClienteWhatsapp] = useState("");
  const [clienteCep, setClienteCep] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteObservacao, setClienteObservacao] = useState("");
  const [finalizandoPedido, setFinalizandoPedido] = useState(false);
  const [ultimoPedidoCriado, setUltimoPedidoCriado] = useState(null);

  const [codigoRastreio, setCodigoRastreio] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);
  const [buscandoPedido, setBuscandoPedido] = useState(false);

  const [formConfig, setFormConfig] = useState({
    whatsapp: "",
    frete_fixo: "15",
    frete_gratis_acima_de: "150",
  });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  function mostrarToast(mensagem, tipo = "info") {
    setToast({ mensagem, tipo });
    window.clearTimeout(window.__spcToastTimer);
    window.__spcToastTimer = window.setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  async function carregarTudo() {
    setCarregando(true);
    try {
      const [resCat, resProd, resPed, resItens, resCfg] =
        await Promise.all([
          supabase
            .from("categorias")
            .select("*")
            .order("nome", { ascending: true }),
          supabase
            .from("produtos")
            .select("*")
            .order("criado_em", { ascending: false }),
          supabase
            .from("pedidos")
            .select("*")
            .order("criado_em", { ascending: false }),
          supabase.from("itens_pedido").select("*"),
          supabase.from("config_loja").select("*").eq("id", 1).maybeSingle(),
        ]);

      if (resCat.data) {
        setCategorias(resCat.data);
        setFormProduto((prev) => ({
          ...prev,
          categoria_id: prev.categoria_id || resCat.data[0]?.id || "",
        }));
      }

      if (resProd.data) {
        setProdutos(resProd.data);
      }

      if (resPed.data) {
        setPedidos(resPed.data);
      }

      if (resItens.data) {
        setItensPedido(resItens.data);
      }

      if (resCfg.data) {
        setConfigLoja(resCfg.data);
        setFormConfig({
          whatsapp: resCfg.data.whatsapp || "",
          frete_fixo: String(resCfg.data.frete_fixo ?? 15),
          frete_gratis_acima_de: String(
            resCfg.data.frete_gratis_acima_de ?? 150
          ),
        });
      }
    } catch (err) {
      console.error(err);
      mostrarToast("Não foi possível carregar os dados do Supabase.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function handleEntrarAdmin(e) {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setAdminAutenticado(true);
      setErroPin("");
      setAbaAtiva("painel");
      carregarTudo();
    } else {
      setErroPin("PIN incorreto. Tente novamente.");
    }
  }

  async function handleCriarCategoria(e) {
    e.preventDefault();
    const nomeLimpo = novaCategoriaNome.trim();
    if (!nomeLimpo) {
      mostrarToast("Digite o nome da categoria.", "erro");
      return;
    }
    setCriandoCategoria(true);
    try {
      const { data, error } = await supabase
        .from("categorias")
        .insert([{ nome: nomeLimpo }])
        .select()
        .single();

      if (error) throw error;
      setCategorias((prev) =>
        [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      );
      setNovaCategoriaNome("");
      mostrarToast(`Categoria "${data.nome}" criada.`, "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast(
        err?.message ||
          "Não foi possível criar (verifique se a categoria já existe).",
        "erro"
      );
    } finally {
      setCriandoCategoria(false);
    }
  }

  async function handleExcluirCategoria(id) {
    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      mostrarToast("Categoria removida.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast(
        "Não foi possível excluir a categoria (verifique se há produtos vinculados).",
        "erro"
      );
    }
  }

  async function handleUploadFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoFoto(true);
    try {
      const extensao = arquivo.name.split(".").pop() || "jpg";
      const nomeArquivo = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_PRODUTOS)
        .upload(nomeArquivo, arquivo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET_PRODUTOS)
        .getPublicUrl(nomeArquivo);

      setFormProduto((prev) => ({
        ...prev,
        foto_url: urlData?.publicUrl || "",
      }));
      mostrarToast("Foto enviada com sucesso.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast(
        `Falha no upload da foto: ${err?.message || "verifique o bucket"}`,
        "erro"
      );
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function handleSalvarProduto(e) {
    e.preventDefault();
    const nomeLimpo = formProduto.nome.trim();
    const precoNum = Number(
      String(formProduto.preco).replace(",", ".")
    );

    if (!nomeLimpo || Number.isNaN(precoNum) || precoNum <= 0) {
      mostrarToast("Preencha o nome e um preço válido.", "erro");
      return;
    }

    setSalvandoProduto(true);
    try {
      const payload = {
        nome: nomeLimpo,
        preco: precoNum,
        categoria_id: formProduto.categoria_id || null,
        prazo_producao:
          formProduto.prazo_producao.trim() || "3 dias úteis",
        descricao: formProduto.descricao.trim(),
        foto_url: formProduto.foto_url.trim(),
        tem_variacoes: Boolean(formProduto.tem_variacoes),
        titulo_variacoes:
          formProduto.titulo_variacoes.trim() || DEFAULT_TITULO_BLOCO,
        titulo_var_1:
          formProduto.titulo_var_1.trim() || DEFAULT_TITULO_VAR_1,
        opcoes_var_1: formProduto.opcoes_var_1.trim(),
        titulo_var_2:
          formProduto.titulo_var_2.trim() || DEFAULT_TITULO_VAR_2,
        opcoes_var_2: formProduto.opcoes_var_2.trim(),
        titulo_var_3:
          formProduto.titulo_var_3.trim() || DEFAULT_TITULO_VAR_3,
        opcoes_var_3: formProduto.opcoes_var_3.trim(),
      };

      const { data, error } = await supabase
        .from("produtos")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      setProdutos((prev) => [data, ...prev]);
      setFormProduto({
        nome: "",
        preco: "",
        categoria_id: categorias[0]?.id || "",
        prazo_producao: "3 dias úteis",
        descricao: "",
        foto_url: "",
        tem_variacoes: true,
        titulo_variacoes: DEFAULT_TITULO_BLOCO,
        titulo_var_1: DEFAULT_TITULO_VAR_1,
        opcoes_var_1: DEFAULT_OPCOES_VAR_1,
        titulo_var_2: DEFAULT_TITULO_VAR_2,
        opcoes_var_2: DEFAULT_OPCOES_VAR_2,
        titulo_var_3: DEFAULT_TITULO_VAR_3,
        opcoes_var_3: DEFAULT_OPCOES_VAR_3,
      });
      mostrarToast(`Produto "${data.nome}" adicionado à vitrine.`, "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast(
        `Não foi possível salvar o produto: ${err?.message || "erro"}`,
        "erro"
      );
    } finally {
      setSalvandoProduto(false);
    }
  }

  async function handleExcluirProduto(id) {
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      mostrarToast("Produto excluído.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Não foi possível excluir o produto.", "erro");
    }
  }

  function obterVariacoesProduto(produto) {
    if (!produto.tem_variacoes) return [];
    const grupos = [
      {
        chave: "var1",
        titulo: produto.titulo_var_1 || DEFAULT_TITULO_VAR_1,
        opcoes: parseCsvOptions(produto.opcoes_var_1),
      },
      {
        chave: "var2",
        titulo: produto.titulo_var_2 || DEFAULT_TITULO_VAR_2,
        opcoes: parseCsvOptions(produto.opcoes_var_2),
      },
      {
        chave: "var3",
        titulo: produto.titulo_var_3 || DEFAULT_TITULO_VAR_3,
        opcoes: parseCsvOptions(produto.opcoes_var_3),
      },
    ];
    return grupos.filter((g) => g.opcoes.length > 0);
  }

  function handleAlterarSelecaoVitrine(produtoId, chaveVar, valor) {
    setSelecoesVitrine((prev) => ({
      ...prev,
      [produtoId]: {
        ...(prev[produtoId] || {}),
        [chaveVar]: valor,
      },
    }));
  }

  function handleAdicionarSacola(produto) {
    const grupos = obterVariacoesProduto(produto);
    const selAtual = selecoesVitrine[produto.id] || {};
    const escolhidas = {};

    for (const g of grupos) {
      escolhidas[g.titulo] = selAtual[g.chave] || g.opcoes[0];
    }

    const resumoVariacoes = Object.entries(escolhidas)
      .map(([tit, val]) => `${tit}: ${val}`)
      .join(" • ");

    const chaveItem = `${produto.id}__${resumoVariacoes}`;

    setSacola((prev) => {
      const existente = prev.find((item) => item.chaveItem === chaveItem);
      if (existente) {
        return prev.map((item) =>
          item.chaveItem === chaveItem
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          chaveItem,
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: Number(produto.preco),
          foto_url: produto.foto_url || "",
          resumo_variacoes: resumoVariacoes,
          quantidade: 1,
        },
      ];
    });

    setSacolaAberta(true);
    mostrarToast(`"${produto.nome}" adicionado à sacola.`, "sucesso");
  }

  function handleAlterarQtdSacola(chaveItem, delta) {
    setSacola((prev) =>
      prev
        .map((item) =>
          item.chaveItem === chaveItem
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  const subtotalSacola = useMemo(
    () =>
      sacola.reduce(
        (acc, item) => acc + Number(item.preco_unitario) * item.quantidade,
        0
      ),
    [sacola]
  );

  const valorFrete = useMemo(() => {
    if (subtotalSacola <= 0) return 0;
    const limiteGratis = Number(configLoja.frete_gratis_acima_de || 0);
    if (limiteGratis > 0 && subtotalSacola >= limiteGratis) return 0;
    return Number(configLoja.frete_fixo || 0);
  }, [subtotalSacola, configLoja]);

  const totalPedidoSacola = subtotalSacola + valorFrete;

  async function handleFinalizarPedido(e) {
    e.preventDefault();
    if (sacola.length === 0) {
      mostrarToast("Sua sacola está vazia.", "erro");
      return;
    }
    if (!clienteNome.trim() || !clienteWhatsapp.trim()) {
      mostrarToast("Preencha nome e WhatsApp.", "erro");
      return;
    }

    setFinalizandoPedido(true);
    try {
      const codigo = gerarCodigoPedido();
      const { data: pedidoCriado, error: pedErr } = await supabase
        .from("pedidos")
        .insert([
          {
            codigo,
            cliente_nome: clienteNome.trim(),
            cliente_whatsapp: clienteWhatsapp.trim(),
            cliente_cep: clienteCep.trim(),
            cliente_endereco: clienteEndereco.trim(),
            observacao: clienteObservacao.trim(),
            subtotal: subtotalSacola,
            frete: valorFrete,
            total: totalPedidoSacola,
            status: "Aguardando Pagamento",
            codigo_rastreio: "",
          },
        ])
        .select()
        .single();

      if (pedErr) throw pedErr;

      const linhasItens = sacola.map((item) => ({
        pedido_id: pedidoCriado.id,
        produto_id: item.produto_id,
        nome_produto: item.nome,
        variacoes_texto: item.resumo_variacoes,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));

      const { error: itensErr } = await supabase
        .from("itens_pedido")
        .insert(linhasItens);

      if (itensErr) throw itensErr;

      setUltimoPedidoCriado(pedidoCriado);
      setSacola([]);
      setClienteNome("");
      setClienteWhatsapp("");
      setClienteCep("");
      setClienteEndereco("");
      setClienteObservacao("");
      await carregarTudo();
      mostrarToast(`Pedido ${codigo} registrado.`, "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Não foi possível concluir o pedido.", "erro");
    } finally {
      setFinalizandoPedido(false);
    }
  }

  async function handleAtualizarStatusPedido(pedidoId, novoStatus) {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", pedidoId);
      if (error) throw error;
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, status: novoStatus } : p
        )
      );
      mostrarToast("Status do pedido atualizado.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao atualizar status.", "erro");
    }
  }

  async function handleSalvarRastreio(pedidoId, rastreioValor) {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ codigo_rastreio: rastreioValor.trim() })
        .eq("id", pedidoId);
      if (error) throw error;
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? { ...p, codigo_rastreio: rastreioValor.trim() }
            : p
        )
      );
      mostrarToast("Código de rastreio salvo.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao salvar rastreio.", "erro");
    }
  }

  async function handleSalvarConfig(e) {
    e.preventDefault();
    setSalvandoConfig(true);
    try {
      const payload = {
        id: 1,
        whatsapp: formConfig.whatsapp.trim(),
        frete_fixo: Number(String(formConfig.frete_fixo).replace(",", ".")) || 0,
        frete_gratis_acima_de:
          Number(String(formConfig.frete_gratis_acima_de).replace(",", ".")) || 0,
      };

      const { data, error } = await supabase
        .from("config_loja")
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      setConfigLoja(data);
      mostrarToast("Configurações da loja salvas.", "sucesso");
    } catch (err) {
      console.error(err);
      mostrarToast("Não foi possível salvar as configurações.", "erro");
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function handleBuscarPedido(e) {
    e.preventDefault();
    const cod = codigoRastreio.trim().toUpperCase();
    if (!cod) return;
    setBuscandoPedido(true);
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .ilike("codigo", cod)
        .maybeSingle();
      if (error) throw error;
      setPedidoEncontrado(data || "nao_encontrado");
    } catch (err) {
      console.error(err);
      mostrarToast("Erro ao consultar pedido.", "erro");
    } finally {
      setBuscandoPedido(false);
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((prod) => {
      const bateCategoria =
        categoriaFiltro === "Todas" || prod.categoria_id === categoriaFiltro;
      const termo = buscaProduto.trim().toLowerCase();
      const bateBusca =
        !termo ||
        (prod.nome || "").toLowerCase().includes(termo) ||
        (prod.descricao || "").toLowerCase().includes(termo);
      return bateCategoria && bateBusca;
    });
  }, [produtos, categoriaFiltro, buscaProduto]);

  const metricas = useMemo(() => {
    const aprovados = pedidos.filter((p) =>
      ["Pagamento Aprovado", "Em Produção", "Enviado", "Entregue"].includes(
        p.status
      )
    );
    const faturamento = aprovados.reduce(
      (acc, p) => acc + Number(p.total || 0),
      0
    );
    const ticketMedio =
      aprovados.length > 0 ? faturamento / aprovados.length : 0;
    const emProducao = pedidos.filter(
      (p) => p.status === "Em Produção"
    ).length;

    return {
      faturamento,
      vendasAprovadas: aprovados.length,
      ticketMedio,
      emProducao,
    };
  }, [pedidos]);

  const totalItensSacola = sacola.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3B2F2F] flex flex-col">
      <header className="bg-[#FFFDF9] border-b border-[#EADFD3] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#4A2E2B]">
              Santo Papel Colorido
            </h1>
            <p className="text-xs italic text-[#8C6D62]">
              Detalhes que encantam
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAbaAtiva("vitrine")}
              className={`px-3.5 py-1.5 rounded-lg text-sm border transition ${
                abaAtiva === "vitrine"
                  ? "bg-[#4A2E2B] text-white border-[#4A2E2B]"
                  : "bg-white text-[#4A2E2B] border-[#DFCFC0]"
              }`}
            >
              Vitrine
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("acompanhar")}
              className={`px-3.5 py-1.5 rounded-lg text-sm border transition ${
                abaAtiva === "acompanhar"
                  ? "bg-[#4A2E2B] text-white border-[#4A2E2B]"
                  : "bg-white text-[#4A2E2B] border-[#DFCFC0]"
              }`}
            >
              Acompanhar Pedido
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("painel")}
              className={`px-3.5 py-1.5 rounded-lg text-sm border transition ${
                abaAtiva === "painel"
                  ? "bg-[#4A2E2B] text-white border-[#4A2E2B]"
                  : "bg-white text-[#4A2E2B] border-[#DFCFC0]"
              }`}
            >
              Painel Ateliê
            </button>
            <button
              type="button"
              onClick={() => setSacolaAberta(true)}
              className="px-3.5 py-1.5 rounded-lg text-sm bg-[#C98A7E] text-white font-medium hover:bg-[#B8776A] transition"
            >
              Sacola ({totalItensSacola})
            </button>
          </nav>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#2D2220] text-white text-sm px-4 py-3 rounded-xl shadow-lg border border-white/10">
          {toast.mensagem}
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {abaAtiva === "vitrine" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#EADFD3] rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoriaFiltro("Todas")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    categoriaFiltro === "Todas"
                      ? "bg-[#4A2E2B] text-white border-[#4A2E2B]"
                      : "bg-[#FAF6F0] text-[#5C4642] border-[#E4D5C7]"
                  }`}
                >
                  Todas
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoriaFiltro(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      categoriaFiltro === cat.id
                        ? "bg-[#4A2E2B] text-white border-[#4A2E2B]"
                        : "bg-[#FAF6F0] text-[#5C4642] border-[#E4D5C7]"
                    }`}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto..."
                className="border border-[#DFCFC0] rounded-lg px-3 py-1.5 text-sm bg-[#FFFDF9] w-full md:w-64"
              />
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="bg-white border border-[#EADFD3] rounded-2xl p-8 text-center text-sm text-[#7A625B]">
                Nenhum produto encontrado nesta seleção.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {produtosFiltrados.map((prod) => {
                  const grupos = obterVariacoesProduto(prod);
                  const selAtual = selecoesVitrine[prod.id] || {};
                  const tituloBloco =
                    prod.titulo_variacoes || DEFAULT_TITULO_BLOCO;

                  return (
                    <article
                      key={prod.id}
                      className="bg-white border border-[#EADFD3] rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        {prod.foto_url ? (
                          <img
                            src={prod.foto_url}
                            alt={prod.nome}
                            className="w-full h-52 object-cover bg-[#F6EFE8]"
                          />
                        ) : (
                          <div className="w-full h-52 bg-[#F6EFE8] flex items-center justify-center text-xs text-[#8C6D62]">
                            Sem foto
                          </div>
                        )}

                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="font-semibold text-base text-[#3B2F2F]">
                              {prod.nome}
                            </h2>
                            <span className="font-semibold text-[#4A2E2B] whitespace-nowrap">
                              {formatBRL(prod.preco)}
                            </span>
                          </div>

                          {prod.prazo_producao && (
                            <p className="text-xs text-[#8C6D62]">
                              Prazo: {prod.prazo_producao}
                            </p>
                          )}

                          {prod.descricao && (
                            <p className="text-xs text-[#5E4A46] leading-relaxed">
                              {prod.descricao}
                            </p>
                          )}

                          {grupos.length > 0 && (
                            <div className="pt-2 border-t border-[#F1E7DC] space-y-2.5">
                              <p className="text-xs font-semibold text-[#4A2E2B]">
                                {tituloBloco}
                              </p>
                              {grupos.map((grupo) => (
                                <div key={grupo.chave} className="space-y-1">
                                  <label className="block text-xs text-[#6E5650]">
                                    {grupo.titulo}
                                  </label>
                                  <select
                                    value={
                                      selAtual[grupo.chave] ||
                                      grupo.opcoes[0]
                                    }
                                    onChange={(e) =>
                                      handleAlterarSelecaoVitrine(
                                        prod.id,
                                        grupo.chave,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-[#DFCFC0] rounded-lg px-2.5 py-1.5 text-xs bg-[#FFFDF9]"
                                  >
                                    {grupo.opcoes.map((op) => (
                                      <option key={op} value={op}>
                                        {op}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => handleAdicionarSacola(prod)}
                          className="w-full py-2 rounded-xl bg-[#C98A7E] text-white text-sm font-medium hover:bg-[#B8776A] transition"
                        >
                          Adicionar à Sacola
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {abaAtiva === "acompanhar" && (
          <div className="max-w-xl mx-auto bg-white border border-[#EADFD3] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-[#4A2E2B]">
              Acompanhar Pedido
            </h2>
            <form onSubmit={handleBuscarPedido} className="flex gap-2">
              <input
                type="text"
                value={codigoRastreio}
                onChange={(e) => setCodigoRastreio(e.target.value)}
                placeholder="Ex.: SPC-12345-ABCD"
                className="flex-1 border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={buscandoPedido}
                className="px-4 py-2 rounded-lg bg-[#4A2E2B] text-white text-sm"
              >
                {buscandoPedido ? "Buscando..." : "Consultar"}
              </button>
            </form>

            {pedidoEncontrado === "nao_encontrado" && (
              <p className="text-sm text-[#9E473B]">
                Pedido não encontrado com esse código.
              </p>
            )}

            {pedidoEncontrado && pedidoEncontrado !== "nao_encontrado" && (
              <div className="border border-[#EADFD3] rounded-xl p-4 bg-[#FAF6F0] space-y-2 text-sm">
                <p>
                  <strong>Código:</strong> {pedidoEncontrado.codigo}
                </p>
                <p>
                  <strong>Status:</strong> {pedidoEncontrado.status}
                </p>
                <p>
                  <strong>Total:</strong> {formatBRL(pedidoEncontrado.total)}
                </p>
                <p>
                  <strong>Rastreio:</strong>{" "}
                  {pedidoEncontrado.codigo_rastreio ||
                    "Ainda não informado"}
                </p>
              </div>
            )}
          </div>
        )}

        {abaAtiva === "painel" && !adminAutenticado && (
          <div className="max-w-sm mx-auto bg-white border border-[#EADFD3] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-[#4A2E2B]">
              Acesso — Painel Ateliê
            </h2>
            <form onSubmit={handleEntrarAdmin} className="space-y-3">
              <div>
                <label className="block text-xs text-[#6E5650] mb-1">
                  PIN de acesso
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {erroPin && (
                <p className="text-xs text-[#9E473B]">{erroPin}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#4A2E2B] text-white text-sm font-medium"
              >
                Entrar
              </button>
            </form>
          </div>
        )}

        {abaAtiva === "painel" && adminAutenticado && (
          <div className="space-y-6">
            <div className="bg-white border border-[#EADFD3] rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-[#4A2E2B]">
                    Painel Administrativo — Santo Papel Colorido
                  </h2>
                  <p className="text-xs text-[#7A625B]">
                    Gerencie pedidos, categorias personalizadas, variações e
                    fotos dos produtos.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={carregarTudo}
                    className="px-3 py-1.5 rounded-lg text-xs border border-[#DFCFC0] bg-[#FAF6F0]"
                  >
                    {carregando ? "Atualizando..." : "Atualizar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPainelAba("pedidos")}
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      painelAba === "pedidos"
                        ? "bg-[#C98A7E] text-white border-[#C98A7E]"
                        : "bg-white border-[#DFCFC0]"
                    }`}
                  >
                    Pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPainelAba("produtos")}
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      painelAba === "produtos"
                        ? "bg-[#C98A7E] text-white border-[#C98A7E]"
                        : "bg-white border-[#DFCFC0]"
                    }`}
                  >
                    Produtos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPainelAba("categorias")}
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      painelAba === "categorias"
                        ? "bg-[#C98A7E] text-white border-[#C98A7E]"
                        : "bg-white border-[#DFCFC0]"
                    }`}
                  >
                    Categorias
                  </button>
                  <button
                    type="button"
                    onClick={() => setPainelAba("config")}
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      painelAba === "config"
                        ? "bg-[#C98A7E] text-white border-[#C98A7E]"
                        : "bg-white border-[#DFCFC0]"
                    }`}
                  >
                    Configurações
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminAutenticado(false)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-[#DFCFC0] text-[#7A625B]"
                  >
                    Sair
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="border border-[#EFE4D8] rounded-xl p-3 bg-[#FFFDF9]">
                  <p className="text-xs text-[#8C6D62]">
                    Faturamento Confirmado
                  </p>
                  <p className="text-lg font-semibold mt-1">
                    {formatBRL(metricas.faturamento)}
                  </p>
                </div>
                <div className="border border-[#EFE4D8] rounded-xl p-3 bg-[#FFFDF9]">
                  <p className="text-xs text-[#8C6D62]">Vendas Aprovadas</p>
                  <p className="text-lg font-semibold mt-1">
                    {metricas.vendasAprovadas}
                  </p>
                </div>
                <div className="border border-[#EFE4D8] rounded-xl p-3 bg-[#FFFDF9]">
                  <p className="text-xs text-[#8C6D62]">Ticket Médio</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatBRL(metricas.ticketMedio)}
                  </p>
                </div>
                <div className="border border-[#EFE4D8] rounded-xl p-3 bg-[#FFFDF9]">
                  <p className="text-xs text-[#8C6D62]">Em Produção</p>
                  <p className="text-lg font-semibold mt-1">
                    {metricas.emProducao}
                  </p>
                </div>
              </div>
            </div>

            {painelAba === "categorias" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <form
                  onSubmit={handleCriarCategoria}
                  className="bg-white border border-[#EADFD3] rounded-2xl p-5 space-y-3"
                >
                  <h3 className="font-semibold text-[#4A2E2B]">
                    Nova Categoria
                  </h3>
                  <p className="text-xs text-[#7A625B]">
                    Crie grupos como Cadernos, Blocos, Adesivos, Planners ou
                    Caixas.
                  </p>
                  <div>
                    <label className="block text-xs text-[#6E5650] mb-1">
                      Nome da categoria
                    </label>
                    <input
                      type="text"
                      value={novaCategoriaNome}
                      onChange={(e) => setNovaCategoriaNome(e.target.value)}
                      placeholder="Ex.: Tags"
                      className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={criandoCategoria}
                    className="w-full py-2.5 rounded-lg bg-[#C98A7E] text-white text-sm font-medium hover:bg-[#B8776A]"
                  >
                    {criandoCategoria ? "Criando..." : "Criar Categoria"}
                  </button>
                </form>

                <div className="bg-white border border-[#EADFD3] rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-[#4A2E2B]">
                    Categorias Cadastradas
                  </h3>
                  {categorias.length === 0 ? (
                    <p className="text-xs text-[#7A625B]">
                      Nenhuma categoria encontrada.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {categorias.map((cat) => (
                        <li
                          key={cat.id}
                          className="flex items-center justify-between border border-[#EFE4D8] rounded-lg px-3 py-2 text-sm bg-[#FAF6F0]"
                        >
                          <span>{cat.nome}</span>
                          <button
                            type="button"
                            onClick={() => handleExcluirCategoria(cat.id)}
                            className="text-xs text-[#9E473B] hover:underline"
                          >
                            Excluir
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {painelAba === "produtos" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <form
                  onSubmit={handleSalvarProduto}
                  className="lg:col-span-5 bg-white border border-[#EADFD3] rounded-2xl p-5 space-y-3"
                >
                  <h3 className="font-semibold text-[#4A2E2B]">
                    Cadastrar Novo Produto
                  </h3>

                  <div>
                    <label className="block text-xs text-[#6E5650] mb-1">
                      Nome do item
                    </label>
                    <input
                      type="text"
                      value={formProduto.nome}
                      onChange={(e) =>
                        setFormProduto((p) => ({
                          ...p,
                          nome: e.target.value,
                        }))
                      }
                      className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#6E5650] mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="text"
                        value={formProduto.preco}
                        onChange={(e) =>
                          setFormProduto((p) => ({
                            ...p,
                            preco: e.target.value,
                          }))
                        }
                        placeholder="8,00"
                        className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#6E5650] mb-1">
                        Categoria
                      </label>
                      <select
                        value={formProduto.categoria_id}
                        onChange={(e) =>
                          setFormProduto((p) => ({
                            ...p,
                            categoria_id: e.target.value,
                          }))
                        }
                        className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="">Sem categoria</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#6E5650] mb-1">
                      Prazo de produção
                    </label>
                    <input
                      type="text"
                      value={formProduto.prazo_producao}
                      onChange={(e) =>
                        setFormProduto((p) => ({
                          ...p,
                          prazo_producao: e.target.value,
                        }))
                      }
                      className="w-full border border-[#DFCFC0] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="border border-[#EFE4D8] rounded-xl p-3.5 bg-[#FAF6F0] space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#4A2E2B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formProduto.tem_variacoes}
                        onChange={(e) =>
                          setFormProduto((p) => ({
                            ...p,
                            tem_variacoes: e.target.checked,
                          }))
                        }
                      />
                      Variações opcionais (dropdown na vitrine)
                    </label>

                    {formProduto.tem_variacoes && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-xs text-[#6E5650] mb-1">
