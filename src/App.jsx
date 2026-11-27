import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  Sparkles,
  Lock,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Edit3,
  Copy,
  Check,
  Store,
  MapPin,
  Phone,
  User,
  QrCode,
  ArrowRight,
  Settings,
  Tag,
  RefreshCw,
  Mail,
  Upload,
  FolderPlus,
  Image as ImageIcon,
  SlidersHorizontal
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const INITIAL_CONFIG = {
  nomeLoja: 'Santo Papel Colorido',
  subtitulo: 'Detalhes que encantam',
  whatsapp: '5512999999999',
  freteBase: 15.0,
  freteGratisAcima: 150.0
};

const DEFAULT_FALLBACK_CATEGORIES = [
  'Topos de Bolo',
  'Lembrancinhas',
  'Kits Festa',
  'Papelaria Corporativa'
];

const DEFAULT_CUSTOM_VARIATIONS = [
  {
    id: 'var-qty',
    titulo: 'Quantidade referente',
    opcoesText: '10 unidades, 20 unidades, 30 unidades, 50 unidades',
    visivel: true
  },
  {
    id: 'var-color',
    titulo: 'Cor',
    opcoesText: 'Azul / Creme, Terracota / Dourado, Rosa Pastel / Branco, Personalizada',
    visivel: true
  },
  {
    id: 'var-size',
    titulo: 'Tamanho',
    opcoesText: 'Pequeno, Médio, Grande',
    visivel: true
  }
];

const STATUS_STEPS = ['Aguardando Pagamento', 'Em Produção', 'Enviado', 'Concluído'];

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function parseOptionsList(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function createNewVariationItem(index = 1) {
  return {
    id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    titulo: `Opção ${index}`,
    opcoesText: '',
    visivel: true
  };
}

function normalizeStoredVariations(productRow) {
  if (Array.isArray(productRow.variacoes_custom) && productRow.variacoes_custom.length > 0) {
    return productRow.variacoes_custom.map((v, idx) => ({
      id: v.id || `var-${idx + 1}`,
      titulo: String(v.titulo || `Opção ${idx + 1}`),
      opcoesText: Array.isArray(v.opcoes)
        ? v.opcoes.join(', ')
        : String(v.opcoesText || ''),
      visivel: v.visivel !== false
    }));
  }

  // Compatibilidade caso exista produto antigo sem variacoes_custom
  if (productRow.variacoes_ativas) {
    const legacy = [];
    if (Array.isArray(productRow.opcoes_quantidade) && productRow.opcoes_quantidade.length > 0) {
      legacy.push({
        id: 'legacy-qty',
        titulo: 'Quantidade referente',
        opcoesText: productRow.opcoes_quantidade.join(', '),
        visivel: true
      });
    }
    if (Array.isArray(productRow.opcoes_cor) && productRow.opcoes_cor.length > 0) {
      legacy.push({
        id: 'legacy-color',
        titulo: 'Cor',
        opcoesText: productRow.opcoes_cor.join(', '),
        visivel: true
      });
    }
    if (Array.isArray(productRow.opcoes_tamanho) && productRow.opcoes_tamanho.length > 0) {
      legacy.push({
        id: 'legacy-size',
        titulo: 'Tamanho',
        opcoesText: productRow.opcoes_tamanho.join(', '),
        visivel: true
      });
    }
    return legacy;
  }

  return [];
}

function BrandLogo({ size = 'md' }) {
  const iconSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const titleSize = size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${iconSize} rounded-full flex items-center justify-center border border-[#D48C84]/50 shadow-sm`}
        style={{ backgroundColor: '#F6ECE8' }}
      >
        <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="13" width="18" height="22" rx="3" transform="rotate(-8 11 13)" fill="#6A8E96" fillOpacity="0.85" />
          <rect x="15" y="11" width="18" height="22" rx="3" transform="rotate(4 15 11)" fill="#D48C84" fillOpacity="0.85" />
          <rect x="18" y="14" width="18" height="22" rx="3" fill="#FAF6F2" stroke="#C99649" strokeWidth="1.2" />
          <path
            d="M25 8.5V16.5C25 18.433 26.567 20 28.5 20C30.433 20 32 18.433 32 16.5V11"
            stroke="#C99649"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M27 24.5C27 23.3954 26.1046 22.5 25 22.5C24.3 22.5 23.7 22.86 23.35 23.4C23 22.86 22.4 22.5 21.7 22.5C20.5954 22.5 19.7 23.3954 19.7 24.5C19.7 26.4 23.35 28.8 23.35 28.8C23.35 28.8 27 26.4 27 24.5Z"
            fill="#D48C84"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <span
          className={`block ${titleSize} font-semibold tracking-wide text-[#4A3B32]`}
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Santo Papel Colorido
        </span>
        <span
          className="block text-sm text-[#6A8E96]"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Detalhes que encantam
        </span>
      </div>
    </div>
  );
}

const emptyProductForm = (defaultCat = '') => ({
  nome: '',
  descricao: '',
  preco: '',
  categoria: defaultCat,
  prazo: '5 dias úteis',
  imagem: '',
  variacoesAtivas: false,
  variacoesList: DEFAULT_CUSTOM_VARIATIONS.map((v) => ({ ...v }))
});

export default function App() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [loadingData, setLoadingData] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [activeTab, setActiveTab] = useState('vitrine');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [freteCalculado, setFreteCalculado] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Escolhas do cliente nos dropdowns de cada produto na vitrine: { [productId]: { [varId]: optionValue } }
  const [selectedVariantsByProduct, setSelectedVariantsByProduct] = useState({});

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    clienteNome: '',
    clienteEmail: '',
    clienteWhatsapp: '',
    clienteCep: '',
    clienteEndereco: ''
  });
  const [pendingOrder, setPendingOrder] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const [trackingQuery, setTrackingQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSection, setAdminSection] = useState('resumo');

  // Gestão de Categorias
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // Gestão de Produtos
  const [newProduct, setNewProduct] = useState(emptyProductForm(''));
  const [editingProductId, setEditingProductId] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 3400);
  }, []);

  const categoryNames = useMemo(() => {
    if (categoriesList.length > 0) {
      return categoriesList.map((c) => c.nome);
    }
    return DEFAULT_FALLBACK_CATEGORIES;
  }, [categoriesList]);

  useEffect(() => {
    if (categoryNames.length > 0 && !categoryNames.includes(newProduct.categoria)) {
      setNewProduct((prev) => ({ ...prev, categoria: categoryNames[0] }));
    }
  }, [categoryNames, newProduct.categoria]);

  const loadAllFromSupabase = useCallback(async () => {
    if (!supabase) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const [prodRes, catRes, ordRes, itemsRes, cfgRes] = await Promise.all([
        supabase.from('produtos').select('*').order('criado_em', { ascending: false }),
        supabase.from('categorias').select('*').order('nome', { ascending: true }),
        supabase.from('pedidos').select('*').order('criado_em', { ascending: false }),
        supabase.from('itens_pedido').select('*'),
        supabase.from('config_loja').select('*').eq('id', 1).single()
      ]);

      if (catRes.data) {
        setCategoriesList(catRes.data);
      }

      if (prodRes.data) {
        setProducts(
          prodRes.data.map((p) => {
            const normalizedVars = normalizeStoredVariations(p);
            const activeVisibleVariations = p.variacoes_ativas
              ? normalizedVars
                  .filter((v) => v.visivel !== false)
                  .map((v, idx) => ({
                    id: v.id || `var-${idx + 1}`,
                    titulo: (v.titulo || '').trim() || `Opção ${idx + 1}`,
                    opcoes: parseOptionsList(v.opcoesText),
                    visivel: true
                  }))
                  .filter((v) => v.opcoes.length > 0)
              : [];

            return {
              id: p.id,
              nome: p.nome,
              descricao: p.descricao || '',
              preco: Number(p.preco),
              categoria: p.categoria,
              prazo: p.prazo_producao || '5 dias úteis',
              imagem:
                p.imagem_url ||
                'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
              ativo: p.ativo !== false,
              variacoesAtivas: Boolean(p.variacoes_ativas),
              variacoesRaw: normalizedVars,
              variacoesVisiveis: activeVisibleVariations
            };
          })
        );
      }

      if (ordRes.data) {
        const allItems = itemsRes.data || [];
        setOrders(
          ordRes.data.map((o) => {
            const orderItems = allItems
              .filter((it) => it.pedido_id === o.id)
              .map((it) => ({
                id: it.produto_id || it.id,
                nome: it.nome_produto,
                quantidade: it.quantidade,
                preco: Number(it.preco_unitario)
              }));

            return {
              dbId: o.id,
              id: o.codigo_pedido,
              clienteNome: o.cliente_nome,
              clienteWhatsapp: o.cliente_whatsapp,
              clienteCep: o.cliente_cep,
              clienteEndereco: o.cliente_endereco,
              itens: orderItems,
              subtotal: Number(o.valor_produtos),
              frete: Number(o.valor_frete),
              total: Number(o.valor_total),
              status: o.status || 'Aguardando Pagamento',
              codigoRastreio: o.codigo_rastreio || '',
              criadoEm: o.criado_em
                ? new Date(o.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recente'
            };
          })
        );
      }

      if (cfgRes.data) {
        setConfig((prev) => ({
          ...prev,
          nomeLoja: cfgRes.data.nome_loja || prev.nomeLoja,
          subtitulo: cfgRes.data.subtitulo || prev.subtitulo,
          whatsapp: cfgRes.data.whatsapp || prev.whatsapp,
          freteBase: Number(cfgRes.data.frete_fixo ?? prev.freteBase),
          freteGratisAcima: Number(cfgRes.data.frete_gratis_acima ?? prev.freteGratisAcima)
        }));
      }
    } catch {
      showToast('Erro ao carregar dados do Supabase');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllFromSupabase();
  }, [loadAllFromSupabase]);

  useEffect(() => {
    if (!pendingOrder || pendingOrder.status !== 'Aguardando Pagamento' || !supabase) return;

    const timer = setInterval(async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('status')
        .eq('codigo_pedido', pendingOrder.id)
        .single();

      if (data && data.status !== 'Aguardando Pagamento') {
        setPendingOrder((prev) => (prev ? { ...prev, status: data.status } : null));
        setOrders((prev) =>
          prev.map((o) => (o.id === pendingOrder.id ? { ...o, status: data.status } : o))
        );
        showToast(`Pix confirmado! Pedido ${pendingOrder.id} agora está "${data.status}".`);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [pendingOrder, showToast]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
    [cart]
  );

  const freteAtual = useMemo(() => {
    if (cart.length === 0) return 0;
    if (subtotal >= config.freteGratisAcima) return 0;
    if (freteCalculado !== null) return freteCalculado;
    return config.freteBase;
  }, [cart.length, subtotal, config.freteGratisAcima, config.freteBase, freteCalculado]);

  const totalCarrinho = subtotal + freteAtual;
  const totalItensCarrinho = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod.ativo) return false;
      const matchesCategory = selectedCategory === 'Todos' || prod.categoria === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        prod.nome.toLowerCase().includes(term) ||
        prod.descricao.toLowerCase().includes(term) ||
        prod.categoria.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Aguardando Pagamento');
    const faturamento = validOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const vendasCount = validOrders.length;
    const ticketMedio = vendasCount > 0 ? faturamento / vendasCount : 0;
    const emProducao = orders.filter((o) => o.status === 'Em Produção').length;
    return { faturamento, vendasCount, ticketMedio, emProducao };
  }, [orders]);

  // Funções para gerenciar as variações dinâmicas no formulário de produto
  const handleAddVariationRow = () => {
    setNewProduct((prev) => {
      const nextIndex = (prev.variacoesList?.length || 0) + 1;
      return {
        ...prev,
        variacoesAtivas: true,
        variacoesList: [...(prev.variacoesList || []), createNewVariationItem(nextIndex)]
      };
    });
  };

  const handleUpdateVariationRow = (varId, field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      variacoesList: (prev.variacoesList || []).map((v) =>
        v.id === varId ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleRemoveVariationRow = (varId) => {
    setNewProduct((prev) => ({
      ...prev,
      variacoesList: (prev.variacoesList || []).filter((v) => v.id !== varId)
    }));
  };

  // Upload direto para Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) {
      showToast('Supabase não conectado');
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(safeName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('produtos').getPublicUrl(safeName);

      if (publicUrlData?.publicUrl) {
        setNewProduct((prev) => ({ ...prev, imagem: publicUrlData.publicUrl }));
        showToast('Foto enviada com sucesso!');
      }
    } catch {
      showToast('Erro ao enviar foto. Verifique se o bucket "produtos" está criado no Storage.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // CRUD de Categorias
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed || !supabase) return;

    setSavingAction(true);
    try {
      const { error } = await supabase.from('categorias').insert({ nome: trimmed });
      if (error) throw error;
      setNewCategoryName('');
      setNewProduct((prev) => ({ ...prev, categoria: trimmed }));
      showToast(`Categoria "${trimmed}" criada e já disponível no cadastro de produto!`);
      await loadAllFromSupabase();
    } catch {
      showToast('Não foi possível criar (verifique se a categoria já existe).');
    } finally {
      setSavingAction(false);
    }
  };

  const handleRenameCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.nome.trim() || !supabase) return;

    const novoNome = editingCategory.nome.trim();
    const nomeAntigo = editingCategory.nomeOriginal;

    setSavingAction(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .update({ nome: novoNome })
        .eq('id', editingCategory.id);

      if (error) throw error;

      if (nomeAntigo && nomeAntigo !== novoNome) {
        await supabase.from('produtos').update({ categoria: novoNome }).eq('categoria', nomeAntigo);
      }

      setEditingCategory(null);
      showToast(`Categoria atualizada para "${novoNome}"!`);
      await loadAllFromSupabase();
    } catch {
      showToast('Erro ao renomear categoria');
    } finally {
      setSavingAction(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!supabase) return;
    setSavingAction(true);
    try {
      const { error } = await supabase.from('categorias').delete().eq('id', cat.id);
      if (error) throw error;
      if (selectedCategory === cat.nome) {
        setSelectedCategory('Todos');
      }
      showToast(`Categoria "${cat.nome}" removida!`);
      await loadAllFromSupabase();
    } catch {
      showToast('Erro ao excluir categoria');
    } finally {
      setSavingAction(false);
    }
  };

  const handleVariantChange = (productId, varId, value) => {
    setSelectedVariantsByProduct((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [varId]: value
      }
    }));
  };

  const handleAddToCart = (product) => {
    let labelResumo = '';
    let cartKey = product.id;

    if (product.variacoesAtivas && Array.isArray(product.variacoesVisiveis) && product.variacoesVisiveis.length > 0) {
      const saved = selectedVariantsByProduct[product.id] || {};
      const parts = product.variacoesVisiveis.map((v) => {
        const chosenVal = saved[v.id] || v.opcoes[0];
        return `${v.titulo}: ${chosenVal}`;
      });
      labelResumo = parts.join(' • ');
      cartKey = `${product.id}__${labelResumo}`;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartKey,
          id: product.id,
          nome: labelResumo ? `${product.nome} (${labelResumo})` : product.nome,
          preco: product.preco,
          imagem: product.imagem,
          quantidade: 1
        }
      ];
    });
    showToast(`"${product.nome}" adicionado à sacola`);
  };

  const handleUpdateQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const handleRemoveFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const handleCalcularFrete = (e) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      showToast('Digite um CEP válido com 8 números');
      return;
    }
    if (subtotal >= config.freteGratisAcima) {
      setFreteCalculado(0);
      showToast('Parabéns! Você ganhou frete grátis');
      return;
    }
    const lastDigit = Number(cleanCep[cleanCep.length - 1]);
    const variacao = lastDigit % 2 === 0 ? 0 : 4;
    const valorFinal = Number(config.freteBase) + variacao;
    setFreteCalculado(valorFinal);
    showToast(`Frete calculado para CEP ${cepInput}: ${formatBRL(valorFinal)}`);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutForm((prev) => ({
      ...prev,
      clienteCep: cepInput || prev.clienteCep
    }));
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCreatePixOrder = async (e) => {
    e.preventDefault();
    if (!checkoutForm.clienteNome.trim() || !checkoutForm.clienteWhatsapp.trim()) {
      showToast('Preencha nome e WhatsApp para gerar o pedido');
      return;
    }
    if (!supabase) {
      showToast('Supabase não conectado');
      return;
    }

    setSavingAction(true);
    const randomNum = Math.floor(1050 + Math.random() * 8900);
    const codigoPedido = `PED-${randomNum}`;

    try {
      const pixRes = await fetch('/api/criar-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoPedido,
          valorTotal: totalCarrinho,
          clienteNome: checkoutForm.clienteNome.trim(),
          clienteEmail: checkoutForm.clienteEmail.trim() || 'cliente@santopapelcolorido.com.br'
        })
      });

      const pixData = await pixRes.json();
      if (!pixRes.ok) {
        throw new Error(pixData.error || 'Falha ao gerar Pix no Mercado Pago');
      }

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('pedidos')
        .insert({
          codigo_pedido: codigoPedido,
          cliente_nome: checkoutForm.clienteNome.trim(),
          cliente_whatsapp: checkoutForm.clienteWhatsapp.trim(),
          cliente_cep: checkoutForm.clienteCep.trim() || '12300-000',
          cliente_endereco: checkoutForm.clienteEndereco.trim() || 'Retirada / A combinar',
          valor_produtos: subtotal,
          valor_frete: freteAtual,
          valor_total: totalCarrinho,
          status: 'Aguardando Pagamento',
          mp_payment_id: pixData.paymentId
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const itensPayload = cart.map((item) => ({
        pedido_id: insertedOrder.id,
        produto_id: item.id,
        nome_produto: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      }));

      await supabase.from('itens_pedido').insert(itensPayload);

      const newOrderObj = {
        dbId: insertedOrder.id,
        id: codigoPedido,
        clienteNome: insertedOrder.cliente_nome,
        clienteWhatsapp: insertedOrder.cliente_whatsapp,
        clienteCep: insertedOrder.cliente_cep,
        clienteEndereco: insertedOrder.cliente_endereco,
        itens: cart.map((i) => ({
          id: i.id,
          nome: i.nome,
          quantidade: i.quantidade,
          preco: i.preco
        })),
        subtotal,
        frete: freteAtual,
        total: totalCarrinho,
        status: 'Aguardando Pagamento',
        codigoRastreio: '',
        qrCodeCopiaECola: pixData.qrCodeCopiaECola,
        qrCodeBase64: pixData.qrCodeBase64,
        criadoEm: 'Agora mesmo'
      };

      setOrders((prev) => [newOrderObj, ...prev]);
      setPendingOrder(newOrderObj);
      setCart([]);
      setFreteCalculado(null);
      showToast(`Pix gerado para o pedido ${codigoPedido}!`);
    } catch (err) {
      showToast(err.message || 'Erro ao gerar cobrança Pix');
    } finally {
      setSavingAction(false);
    }
  };

  const handleCopyPix = () => {
    const code = pendingOrder?.qrCodeCopiaECola || '';
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    const term = trackingQuery.trim().toLowerCase();
    setTrackingSearched(true);
    if (!term) {
      setFoundOrder(null);
      return;
    }
    await loadAllFromSupabase();
    const match = orders.find(
      (o) =>
        o.id.toLowerCase() === term ||
        o.id.toLowerCase().includes(term) ||
        o.clienteWhatsapp.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
    );
    setFoundOrder(match || null);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword.trim() === 'santo2026' || adminPassword.trim() === '1234') {
      setIsAdminAuthenticated(true);
      setAdminError('');
      setAdminPassword('');
    } else {
      setAdminError('Senha incorreta. Dica para teste: santo2026');
    }
  };

  const handleOrderStatusChange = async (orderId, nextStatus) => {
    if (!supabase) return;
    await supabase.from('pedidos').update({ status: nextStatus }).eq('codigo_pedido', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (foundOrder?.id === orderId) {
      setFoundOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    showToast(`Status do pedido ${orderId} atualizado para "${nextStatus}"`);
  };

  const handleTrackingCodeChange = async (orderId, code) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, codigoRastreio: code } : o))
    );
    if (foundOrder?.id === orderId) {
      setFoundOrder((prev) => (prev ? { ...prev, codigoRastreio: code } : null));
    }
    if (supabase) {
      await supabase.from('pedidos').update({ codigo_rastreio: code }).eq('codigo_pedido', orderId);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const precoNum = parseFloat(String(newProduct.preco).replace(',', '.'));
    if (!newProduct.nome.trim() || isNaN(precoNum) || precoNum <= 0) {
      showToast('Preencha nome e preço válido do produto');
      return;
    }
    if (!supabase) {
      showToast('Supabase não conectado');
      return;
    }

    const categoriaEscolhida = newProduct.categoria || categoryNames[0] || 'Geral';
    const sanitizedVariations = (newProduct.variacoesList || [])
      .map((v, idx) => ({
        id: v.id || `var-${idx + 1}`,
        titulo: (v.titulo || '').trim() || `Opção ${idx + 1}`,
        opcoes: parseOptionsList(v.opcoesText),
        visivel: v.visivel !== false
      }))
      .filter((v) => v.opcoes.length > 0);

    const payload = {
      nome: newProduct.nome.trim(),
      descricao: newProduct.descricao.trim() || 'Peça artesanal personalizada.',
      preco: precoNum,
      categoria: categoriaEscolhida,
      prazo_producao: newProduct.prazo || '5 dias úteis',
      imagem_url:
        newProduct.imagem.trim() ||
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
      variacoes_ativas: Boolean(newProduct.variacoesAtivas) && sanitizedVariations.length > 0,
      variacoes_custom: sanitizedVariations
    };

    setSavingAction(true);
    try {
      if (editingProductId) {
        const { error } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', editingProductId);

        if (error) throw error;
        setEditingProductId(null);
        showToast('Produto atualizado!');
      } else {
        const { error } = await supabase.from('produtos').insert({
          ...payload,
          ativo: true
        });

        if (error) throw error;
        showToast('Produto salvo na vitrine!');
      }

      setNewProduct(emptyProductForm(categoriaEscolhida));
      await loadAllFromSupabase();
    } catch (err) {
      showToast(err?.message || 'Erro ao salvar produto. Rode o SQL da coluna variacoes_custom no Supabase.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleStartEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const existingVars = normalizeStoredVariations(prod);
    setNewProduct({
      nome: prod.nome,
      descricao: prod.descricao,
      preco: String(prod.preco),
      categoria: prod.categoria,
      prazo: prod.prazo,
      imagem: prod.imagem,
      variacoesAtivas: Boolean(prod.variacoesAtivas),
      variacoesList:
        existingVars.length > 0
          ? existingVars
          : DEFAULT_CUSTOM_VARIATIONS.map((v) => ({ ...v }))
    });
  };

  const handleToggleProductActive = async (prod) => {
    if (!supabase) return;
    const nextActive = !prod.ativo;
    await supabase.from('produtos').update({ ativo: nextActive }).eq('id', prod.id);
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, ativo: nextActive } : p)));
  };

  const handleSaveConfig = async (updatedFields) => {
    const nextCfg = { ...config, ...updatedFields };
    setConfig(nextCfg);
    if (supabase) {
      await supabase
        .from('config_loja')
        .update({
          nome_loja: nextCfg.nomeLoja,
          subtitulo: nextCfg.subtitulo,
          frete_fixo: nextCfg.freteBase,
          frete_gratis_acima: nextCfg.freteGratisAcima
        })
        .eq('id', 1);
    }
  };

  return (
    <div
      className="min-h-screen text-[#4A3B32] flex flex-col"
      style={{
        backgroundColor: '#FAF6F2',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Dancing+Script:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#4A3B32] text-[#FAF6F2] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm border border-[#C99649]/40">
          <Sparkles className="w-4 h-4 text-[#C99649] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-[#FAF6F2]/95 backdrop-blur border-b border-[#E8DDD4]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('vitrine')}
            className="text-left focus:outline-none"
          >
            <BrandLogo />
          </button>

          <nav className="flex items-center gap-1.5 sm:gap-2 bg-[#F3EAE2] p-1 rounded-xl border border-[#E4D6C9]">
            <button
              type="button"
              onClick={() => setActiveTab('vitrine')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'vitrine'
                  ? 'bg-[#D48C84] text-white shadow-sm'
                  : 'text-[#4A3B32] hover:bg-white/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vitrine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rastreio')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'rastreio'
                  ? 'bg-[#6A8E96] text-white shadow-sm'
                  : 'text-[#4A3B32] hover:bg-white/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Acompanhar Pedido</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#4A3B32] text-[#FAF6F2] shadow-sm'
                  : 'text-[#4A3B32] hover:bg-white/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#C99649]" />
              <span>Painel Ateliê</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#D48C84] hover:bg-[#c57b73] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sacola</span>
            {totalItensCarrinho > 0 && (
              <span className="bg-[#4A3B32] text-[#FAF6F2] text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItensCarrinho}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'vitrine' && (
        <main className="flex-1">
          <section className="max-w-6xl mx-auto px-4 pt-6 pb-4">
            <div className="rounded-3xl bg-gradient-to-r from-[#F5EAE3] via-[#FAF6F2] to-[#EAF1F3] border border-[#E6D8CC] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-[#6A8E96]/15 text-[#4E6E75]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C99649]" />
                  Papelaria Criativa &amp; Feita à Mão
                </span>
                <h1
                  className="text-3xl sm:text-5xl font-semibold text-[#4A3B32] leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {config.nomeLoja} — {config.subtitulo}
                </h1>
                <p className="text-sm sm:text-base text-[#6B584C] leading-relaxed">
                  Escolha suas peças, calcule o frete, finalize o pagamento com Pix e acompanhe cada etapa da produção até a entrega em um só lugar.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B584C]">
                  <span className="bg-white/80 border border-[#E6D8CC] px-3 py-1.5 rounded-lg">
                    Frete grátis acima de <strong>{formatBRL(config.freteGratisAcima)}</strong>
                  </span>
                </div>
              </div>

              <div className="w-full md:w-80 rounded-2xl overflow-hidden shadow-md border border-[#E2D3C5] bg-white shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80"
                  alt="Papelaria artesanal Santo Papel Colorido"
                  className="w-full h-48 object-cover"
                />
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4A3B32]">Coleção Afetiva</span>
                  <span className="text-[#C99649] font-semibold">Produção sob encomenda</span>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['Todos', ...categoryNames].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition border ${
                      selectedCategory === cat
                        ? 'bg-[#D48C84] text-white border-[#D48C84]'
                        : 'bg-white text-[#4A3B32] border-[#E5D7CA] hover:border-[#D48C84]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#8B7669] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar item..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E5D7CA] text-sm focus:outline-none focus:border-[#D48C84]"
                />
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 pb-14">
            {loadingData ? (
              <div className="bg-white rounded-2xl border border-[#E5D7CA] p-10 text-center text-sm text-[#6B584C]">
                Carregando catálogo do ateliê...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5D7CA] p-10 text-center space-y-2">
                <p className="font-semibold text-base">Nenhum produto ativo encontrado.</p>
                <p className="text-xs text-[#6B584C]">
                  Cadastre seus primeiros itens na aba <strong>Painel Ateliê &gt; Produtos</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const visibleVars = product.variacoesVisiveis || [];
                  const savedChoices = selectedVariantsByProduct[product.id] || {};

                  return (
                    <article
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#E8DBD0] overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 bg-[#F4ECE5] overflow-hidden">
                          <img
                            src={product.imagem}
                            alt={product.nome}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-[#FAF6F2]/95 text-[#4A3B32] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#E5D7CA]">
                            {product.categoria}
                          </span>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <h2
                            className="text-xl font-semibold text-[#4A3B32] leading-snug"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                          >
                            {product.nome}
                          </h2>
                          <p className="text-xs text-[#6B584C] line-clamp-2 leading-relaxed">
                            {product.descricao}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#6A8E96] font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Prazo: {product.prazo}</span>
                          </div>

                          {product.variacoesAtivas && visibleVars.length > 0 && (
                            <div className="pt-2 space-y-2 border-t border-[#F3ECE5]">
                              {visibleVars.map((v) => {
                                const currentVal = savedChoices[v.id] || v.opcoes[0];
                                return (
                                  <div key={v.id}>
                                    <label className="block text-[11px] font-semibold text-[#6B584C] mb-1">
                                      {v.titulo}
                                    </label>
                                    <select
                                      value={currentVal}
                                      onChange={(e) =>
                                        handleVariantChange(product.id, v.id, e.target.value)
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFCFC1] bg-[#FAF6F2] text-xs text-[#4A3B32]"
                                    >
                                      {v.opcoes.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-[#F3ECE5] flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-[11px] text-[#8B7669]">Valor</span>
                          <strong className="text-base font-bold text-[#4A3B32]">
                            {formatBRL(product.preco)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="bg-[#4A3B32] hover:bg-[#362a23] text-[#FAF6F2] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C99649]" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {activeTab === 'rastreio' && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
          <div className="bg-white rounded-3xl border border-[#E6D8CC] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6A8E96]">
                Consulta Autônoma
              </span>
              <h1
                className="text-3xl font-semibold text-[#4A3B32]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Acompanhar meu Pedido
              </h1>
              <p className="text-sm text-[#6B584C]">
                Digite o código do pedido (ex.: <strong>PED-1050</strong>) ou o WhatsApp cadastrado.
              </p>
            </div>

            <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Ex.: PED-1050 ou (12) 99999-0000"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm focus:outline-none focus:border-[#6A8E96]"
              />
              <button
                type="submit"
                className="bg-[#6A8E96] hover:bg-[#597a82] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </button>
            </form>

            {trackingSearched && !foundOrder && (
              <div className="p-4 rounded-2xl bg-[#FDF4F2] border border-[#F0CFC8] text-sm text-[#8F4A42]">
                Nenhum pedido encontrado para &ldquo;{trackingQuery}&rdquo;.
              </div>
            )}

            {foundOrder && (
              <div className="border border-[#E6D8CC] rounded-2xl p-5 bg-[#FAF6F2]/60 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6D8CC] pb-3">
                  <div>
                    <span className="text-xs text-[#8B7669]">Código do pedido</span>
                    <h2 className="text-lg font-bold text-[#4A3B32]">
                      {foundOrder.id} — {foundOrder.clienteNome}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#6A8E96]/15 text-[#4E6E75]">
                    {foundOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.indexOf(foundOrder.status);
                    const done = idx <= currentIdx;
                    return (
                      <div
                        key={step}
                        className={`p-3 rounded-xl border text-xs ${
                          done
                            ? 'bg-white border-[#6A8E96] text-[#4A3B32] font-semibold'
                            : 'bg-[#F3EAE2]/60 border-[#E5D7CA] text-[#9A877B]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2
                            className={`w-4 h-4 ${done ? 'text-[#6A8E96]' : 'text-[#C5B5A9]'}`}
                          />
                          <span>Etapa {idx + 1}</span>
                        </div>
                        <p className="leading-snug">{step}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-[#E8DBD0]">
                  <div className="space-y-1">
                    <p className="text-[#8B7669] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D48C84]" /> Endereço de entrega
                    </p>
                    <p className="font-medium text-[#4A3B32]">{foundOrder.clienteEndereco}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#8B7669] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#6A8E96]" /> Código de rastreio
                    </p>
                    <p className="font-semibold text-[#4A3B32]">
                      {foundOrder.codigoRastreio
                        ? foundOrder.codigoRastreio
                        : 'Aguardando postagem / atualização no painel'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-[#6B584C]">Total do pedido (incl. frete):</span>
                  <strong className="text-base text-[#4A3B32]">{formatBRL(foundOrder.total)}</strong>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {activeTab === 'admin' && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E6D8CC] p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#4A3B32] text-[#C99649] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-semibold text-[#4A3B32]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Acesso do Ateliê
                  </h1>
                  <p className="text-xs text-[#6B584C]">Gestão de vendas, categorias, catálogo e rastreio</p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Senha de acesso
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite santo2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm focus:outline-none focus:border-[#D48C84]"
                  />
                  {adminError && <p className="text-xs text-red-600 mt-1">{adminError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4A3B32] hover:bg-[#352922] text-[#FAF6F2] py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Entrar no Painel
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold text-[#4A3B32]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Painel Administrativo — {config.nomeLoja}
                  </h1>
                  <p className="text-xs text-[#6B584C]">
                    Gerencie pedidos, categorias personalizadas, variações e fotos dos produtos.
                  </p
