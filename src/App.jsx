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
const ADMIN_SESSION_KEY = 'spc_admin_session_v1';
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

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
  if (!productRow) return [];

  if (Array.isArray(productRow.variacoesRaw) && productRow.variacoesRaw.length > 0) {
    return productRow.variacoesRaw.map((v, idx) => ({
      id: v?.id || `var-${idx + 1}`,
      titulo: String(v?.titulo || `Opção ${idx + 1}`),
      opcoesText: Array.isArray(v?.opcoes)
        ? v.opcoes.join(', ')
        : String(v?.opcoesText || ''),
      visivel: v?.visivel !== false
    }));
  }

  let rawCustom = productRow.variacoes_custom;
  if (typeof rawCustom === 'string') {
    try {
      rawCustom = JSON.parse(rawCustom);
    } catch {
      rawCustom = [];
    }
  }

  if (Array.isArray(rawCustom) && rawCustom.length > 0) {
    return rawCustom.map((v, idx) => ({
      id: v?.id || `var-${idx + 1}`,
      titulo: String(v?.titulo || `Opção ${idx + 1}`),
      opcoesText: Array.isArray(v?.opcoes)
        ? v.opcoes.join(', ')
        : String(v?.opcoesText || ''),
      visivel: v?.visivel !== false
    }));
  }

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

function mapProductRowFromDb(p) {
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
    variacoes_custom: p.variacoes_custom || [],
    variacoesRaw: normalizedVars,
    variacoesVisiveis: activeVisibleVariations
  };
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

async function lookupCepAddress(rawCep) {
  const digits = String(rawCep || '').replace(/\D/g, '');
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.erro) return null;

    const parts = [
      data.logradouro,
      data.bairro ? `${data.bairro}` : '',
      data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : data.localidade
    ].filter(Boolean);

    return parts.join(', ');
  } catch {
    return null;
  }
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [loadingData, setLoadingData] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingEditProduct, setLoadingEditProduct] = useState(false);

  const [activeTab, setActiveTab] = useState('vitrine');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [freteCalculado, setFreteCalculado] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  const [selectedVariantsByProduct, setSelectedVariantsByProduct] = useState({});

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    clienteNome: '',
    clienteEmail: '',
    clienteWhatsapp: '',
    clienteCep: '',
    clienteEndereco: '',
    clienteNumero: '',
    clienteComplemento: ''
  });
  const [lastLookedUpCep, setLastLookedUpCep] = useState('');
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const [isAddressManuallyEdited, setIsAddressManuallyEdited] = useState(false);

  useEffect(() => {
    const digits = checkoutForm.clienteCep.replace(/\D/g, '');
    if (digits.length !== 8 || digits === lastLookedUpCep) return;

    let cancelled = false;
    setLookingUpCep(true);

    lookupCepAddress(digits).then((enderecoEncontrado) => {
      if (cancelled) return;
      setLookingUpCep(false);
      setLastLookedUpCep(digits);

      if (enderecoEncontrado) {
        setCheckoutForm((prev) => {
          if (isAddressManuallyEdited && prev.clienteEndereco.trim() !== '') {
            return prev;
          }
          return {
            ...prev,
            clienteEndereco: enderecoEncontrado
          };
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [checkoutForm.clienteCep, lastLookedUpCep, isAddressManuallyEdited]);

  const [pendingOrder, setPendingOrder] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const [trackingQuery, setTrackingQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.expiresAt === 'number' && Date.now() < parsed.expiresAt) {
        return true;
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    } catch {
      return false;
    }
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSection, setAdminSection] = useState('resumo');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

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
        setProducts(prodRes.data.map(mapProductRowFromDb));
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
    setIsCartOpen(false);
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
    setIsAddressManuallyEdited(false);
    setLastLookedUpCep('');
    setCheckoutForm((prev) => ({
      ...prev,
      clienteCep: cepInput || prev.clienteCep
    }));
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const formatFullDeliveryAddress = () => {
    const rua = checkoutForm.clienteEndereco.trim();
    const numero = checkoutForm.clienteNumero.trim();
    const complemento = checkoutForm.clienteComplemento.trim();

    if (!rua && !numero && !complemento) {
      return 'Retirada / A combinar';
    }

    const baseComNumero = rua && numero ? `${rua}, ${numero}` : rua || numero;
    return complemento ? `${baseComNumero} — ${complemento}` : baseComNumero;
  };

  const handleCreatePixOrder = async (e) => {
    e.preventDefault();
    if (!checkoutForm.clienteNome.trim() || !checkoutForm.clienteWhatsapp.trim()) {
      showToast('Preencha nome e WhatsApp para gerar o pedido');
      return;
    }

    const cleanCep = checkoutForm.clienteCep.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      showToast('Por favor, preencha um CEP válido com 8 números para continuar.');
      return;
    }

    if (!checkoutForm.clienteNumero.trim()) {
      showToast('Por favor, preencha o número do endereço.');
      return;
    }

    if (!supabase) {
      showToast('Supabase não conectado');
      return;
    }

    setSavingAction(true);
    const randomNum = Math.floor(1050 + Math.random() * 8900);
    const codigoPedido = `PED-${randomNum}`;
    const enderecoCompleto = formatFullDeliveryAddress();

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

      const rawText = await pixRes.text();
      let pixData = {};
      try {
        pixData = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error('Não foi possível conectar ao serviço de Pix no momento. Tente novamente.');
      }

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
          cliente_endereco: enderecoCompleto,
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
      try {
        localStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({ expiresAt: Date.now() + ADMIN_SESSION_TTL_MS })
        );
      } catch {}
      setIsAdminAuthenticated(true);
      setAdminError('');
      setAdminPassword('');
    } else {
      setAdminError('Senha incorreta.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
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
        const { data: updatedRows, error } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', editingProductId)
          .select();

        if (error) throw error;
        if (!updatedRows || updatedRows.length === 0) {
          throw new Error(
            'Nenhuma linha foi atualizada no Supabase. Verifique a permissão de UPDATE em produtos.'
          );
        }

        const mappedUpdated = mapProductRowFromDb(updatedRows[0]);
        setProducts((prev) =>
          prev.map((item) => (item.id === mappedUpdated.id ? mappedUpdated : item))
        );
        setEditingProductId(null);
        showToast('Produto atualizado!');
      } else {
        const { data: insertedRows, error } = await supabase
          .from('produtos')
          .insert({
            ...payload,
            ativo: true
          })
          .select();

        if (error) throw error;
        if (!insertedRows || insertedRows.length === 0) {
          throw new Error('Nenhuma linha foi inserida no Supabase.');
        }

        const mappedInserted = mapProductRowFromDb(insertedRows[0]);
        setProducts((prev) => [mappedInserted, ...prev]);
        showToast('Produto salvo na vitrine!');
      }

      setNewProduct(emptyProductForm(categoriaEscolhida));
      await loadAllFromSupabase();
    } catch (err) {
      showToast(err?.message || 'Erro ao salvar produto no Supabase.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleStartEditProduct = async (prod) => {
    setEditingProductId(prod.id);
    setLoadingEditProduct(true);

    let targetProd = products.find((p) => p.id === prod.id) || prod;

    try {
      if (supabase) {
        const { data: freshRow, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', prod.id)
          .single();

        if (!error && freshRow) {
          targetProd = mapProductRowFromDb(freshRow);
          setProducts((prev) =>
            prev.map((item) => (item.id === targetProd.id ? targetProd : item))
          );
        }
      }
    } finally {
      setLoadingEditProduct(false);
    }

    const existingVars = normalizeStoredVariations(targetProd);
    setNewProduct({
      nome: targetProd.nome,
      descricao: targetProd.descricao,
      preco: String(targetProd.preco),
      categoria: targetProd.categoria,
      prazo: targetProd.prazo,
      imagem: targetProd.imagem,
      variacoesAtivas: Boolean(targetProd.variacoesAtivas),
      variacoesList:
        existingVars.length > 0
          ? existingVars.map((v) => ({ ...v }))
          : DEFAULT_CUSTOM_VARIATIONS.map((v) => ({ ...v }))
    });
  };

  const handleToggleProductActive = async (prod) => {
    if (!supabase) return;
    const nextActive = !prod.ativo;
    const { data: updatedRows, error } = await supabase
      .from('produtos')
      .update({ ativo: nextActive })
      .eq('id', prod.id)
      .select();

    if (error || !updatedRows || updatedRows.length === 0) {
      showToast('Não foi possível alterar o status do produto no Supabase.');
      return;
    }
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
                            onClick={() => setLightboxImage({ src: product.imagem, alt: product.nome })}
                            className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer"
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
                          <p className="text-xs text-[#6B584C] leading-relaxed whitespace-pre-line">
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
                    placeholder="Digite a senha"
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
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={loadAllFromSupabase}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF6F2] text-[#4A3B32] border border-[#E5D7CA] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Atualizar</span>
                  </button>

                  {[
                    { id: 'resumo', label: 'Pedidos', icon: TrendingUp },
                    { id: 'produtos', label: 'Produtos', icon: Tag },
                    { id: 'categorias', label: 'Categorias', icon: FolderPlus },
                    { id: 'config', label: 'Configurações', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAdminSection(tab.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          adminSection === tab.id
                            ? 'bg-[#D48C84] text-white'
                            : 'bg-[#FAF6F2] text-[#4A3B32] border border-[#E5D7CA]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#6B584C] hover:bg-[#F3EAE2] flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                  <div className="flex items-center justify-between text-xs text-[#6B584C] mb-1">
                    <span>Faturamento Confirmado</span>
                    <DollarSign className="w-4 h-4 text-[#C99649]" />
                  </div>
                  <p className="text-2xl font-bold text-[#4A3B32]">{formatBRL(metrics.faturamento)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                  <div className="flex items-center justify-between text-xs text-[#6B584C] mb-1">
                    <span>Vendas Aprovadas</span>
                    <ShoppingCart className="w-4 h-4 text-[#D48C84]" />
                  </div>
                  <p className="text-2xl font-bold text-[#4A3B32]">{metrics.vendasCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                  <div className="flex items-center justify-between text-xs text-[#6B584C] mb-1">
                    <span>Ticket Médio</span>
                    <TrendingUp className="w-4 h-4 text-[#6A8E96]" />
                  </div>
                  <p className="text-2xl font-bold text-[#4A3B32]">{formatBRL(metrics.ticketMedio)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                  <div className="flex items-center justify-between text-xs text-[#6B584C] mb-1">
                    <span>Em Produção</span>
                    <Package className="w-4 h-4 text-[#6A8E96]" />
                  </div>
                  <p className="text-2xl font-bold text-[#4A3B32]">{metrics.emProducao}</p>
                </div>
              </div>

              {adminSection === 'resumo' && (
                <div className="bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-4">
                  <h2 className="text-lg font-bold text-[#4A3B32]">Pedidos e Rastreio</h2>

                  {orders.length === 0 ? (
                    <p className="text-sm text-[#6B584C]">Nenhum pedido registrado ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-xl bg-[#FAF6F2] border border-[#E8DBD0] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#4A3B32]">{order.id}</span>
                              <span className="text-xs text-[#8B7669]">• {order.criadoEm}</span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#DFCFC1]">
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-[#4A3B32]">
                              {order.clienteNome} — {order.clienteWhatsapp}
                            </p>
                            <p className="text-xs text-[#6B584C]">
                              {order.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}{' '}
                              <strong>• Total: {formatBRL(order.total)}</strong>
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="px-3 py-2 rounded-xl border border-[#DFCFC1] bg-white text-xs font-medium text-[#4A3B32]"
                            >
                              {STATUS_STEPS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              value={order.codigoRastreio || ''}
                              onChange={(e) => handleTrackingCodeChange(order.id, e.target.value)}
                              placeholder="Código de rastreio"
                              className="px-3 py-2 rounded-xl border border-[#DFCFC1] bg-white text-xs text-[#4A3B32] w-full sm:w-44"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminSection === 'categorias' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <form
                    onSubmit={handleAddCategory}
                    className="bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-3 h-fit"
                  >
                    <h2 className="text-lg font-bold text-[#4A3B32]">Nova Categoria</h2>
                    <p className="text-xs text-[#6B584C]">
                      Crie grupos como Cadernos, Blocos, Adesivos, Planners ou Caixas.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome da categoria</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex.: Cadernos Personalizados"
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingAction}
                      className="w-full bg-[#D48C84] hover:bg-[#c37971] text-white py-2.5 rounded-xl text-xs font-semibold transition"
                    >
                      {savingAction ? 'Salvando...' : 'Criar Categoria'}
                    </button>
                  </form>

                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-3">
                    <h2 className="text-lg font-bold text-[#4A3B32]">Categorias Cadastradas</h2>
                    {categoriesList.length === 0 ? (
                      <p className="text-xs text-[#6B584C]">
                        Nenhuma categoria encontrada. Crie uma ao lado ou rode o SQL da tabela{' '}
                        <code>categorias</code> no Supabase.
                      </p>
                    ) : (
                      categoriesList.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF6F2] border border-[#E8DBD0]"
                        >
                          {editingCategory?.id === cat.id ? (
                            <form onSubmit={handleRenameCategory} className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingCategory.nome}
                                onChange={(e) =>
                                  setEditingCategory({ ...editingCategory, nome: e.target.value })
                                }
                                className="flex-1 px-3 py-1.5 rounded-lg border border-[#DFCFC1] bg-white text-sm"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 rounded-lg bg-[#6A8E96] text-white text-xs font-semibold"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-[#DFCFC1] text-xs"
                              >
                                Cancelar
                              </button>
                            </form>
                          ) : (
                            <>
                              <span className="font-semibold text-sm text-[#4A3B32]">{cat.nome}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingCategory({
                                      id: cat.id,
                                      nome: cat.nome,
                                      nomeOriginal: cat.nome
                                    })
                                  }
                                  className="p-2 rounded-lg bg-white border border-[#DFCFC1] hover:bg-[#F3EAE2]"
                                  title="Renomear categoria"
                                >
                                  <Edit3 className="w-4 h-4 text-[#4A3B32]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-2 rounded-lg bg-white border border-[#DFCFC1] hover:bg-red-50 text-red-600"
                                  title="Excluir categoria"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {adminSection === 'produtos' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <form
                    onSubmit={handleSaveProduct}
                    className="bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-3.5 h-fit"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold text-[#4A3B32]">
                        {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                      </h2>
                      {loadingEditProduct && (
                        <span className="text-[11px] font-semibold text-[#6A8E96]">
                          Sincronizando...
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome do item</label>
                      <input
                        type="text"
                        value={newProduct.nome}
                        onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                        placeholder="Ex.: Topo de Bolo Bailarina"
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Preço (R$)</label>
                        <input
                          type="text"
                          value={newProduct.preco}
                          onChange={(e) => setNewProduct({ ...newProduct, preco: e.target.value })}
                          placeholder="45.00"
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Categoria</label>
                        <select
                          value={newProduct.categoria || categoryNames[0] || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                        >
                          {categoryNames.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Prazo de produção</label>
                      <input
                        type="text"
                        value={newProduct.prazo}
                        onChange={(e) => setNewProduct({ ...newProduct, prazo: e.target.value })}
                        placeholder="5 dias úteis"
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAF6F2] border border-[#E5D7CA] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#4A3B32]">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#6A8E96]" />
                          <span>Variações opcionais (dropdown na vitrine)</span>
                          <input
                            type="checkbox"
                            checked={newProduct.variacoesAtivas}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, variacoesAtivas: e.target.checked })
                            }
                            className="w-4 h-4 accent-[#D48C84] ml-1"
                          />
                        </label>
                      </div>

                      {newProduct.variacoesAtivas && (
                        <div className="space-y-2.5 pt-2 border-t border-[#E8DBD0]">
                          {(Array.isArray(newProduct.variacoesList) ? newProduct.variacoesList : []).map((v, idx) => (
                            <div
                              key={v.id}
                              className="p-2.5 rounded-xl bg-white border border-[#E6D8CC] space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[#6A8E96]">
                                  Variação {idx + 1}
                                </span>

                                <div className="flex items-center gap-2.5">
                                  <label className="flex items-center gap-1 text-[11px] font-semibold text-[#4A3B32] cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={v.visivel !== false}
                                      onChange={(e) =>
                                        handleUpdateVariationRow(v.id, 'visivel', e.target.checked)
                                      }
                                      className="w-3.5 h-3.5 accent-[#6A8E96]"
                                    />
                                    <span>Visível</span>
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariationRow(v.id)}
                                    className="text-[#9A877B] hover:text-red-600 p-0.5"
                                    title="Remover esta variação"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={v.titulo}
                                onChange={(e) =>
                                  handleUpdateVariationRow(v.id, 'titulo', e.target.value)
                                }
                                placeholder="Título do campo (ex.: Cor, Tamanho, Modelo, Fita)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFCFC1] bg-[#FAF6F2] text-xs font-semibold text-[#4A3B32]"
                              />

                              <input
                                type="text"
                                value={v.opcoesText}
                                onChange={(e) =>
                                  handleUpdateVariationRow(v.id, 'opcoesText', e.target.value)
                                }
                                placeholder="Opções separadas por vírgula (ex.: Azul, Creme, Dourado)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFCFC1] bg-white text-xs text-[#4A3B32]"
                              />
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={handleAddVariationRow}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-[#6A8E96] bg-white hover:bg-[#EAF1F3]/60 text-xs font-semibold text-[#4E6E75] flex items-center justify-center gap-1.5 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar outra variação</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold">Foto do produto</label>
                      <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-[#D48C84] bg-[#FAF6F2] hover:bg-[#F4EAE3] cursor-pointer text-xs font-semibold text-[#4A3B32] transition">
                        <Upload className="w-4 h-4 text-[#D48C84]" />
                        <span>
                          {uploadingImage ? 'Enviando foto...' : 'Escolher foto do aparelho'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>

                      {newProduct.imagem && (
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF6F2] border border-[#E8DBD0]">
                          <img
                            src={newProduct.imagem}
                            alt="Prévia"
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-[#6A8E96] flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Foto pronta
                            </p>
                            <p className="text-[10px] text-[#8B7669] truncate">{newProduct.imagem}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Descrição</label>
                      <textarea
                        rows={2}
                        value={newProduct.descricao}
                        onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })}
                        placeholder="Detalhes do papel, personalização e medidas..."
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={savingAction || uploadingImage || loadingEditProduct}
                        className="flex-1 bg-[#D48C84] hover:bg-[#c37971] text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-60"
                      >
                        {savingAction
                          ? 'Salvando...'
                          : editingProductId
                            ? 'Salvar Alterações'
                            : 'Adicionar à Vitrine'}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setNewProduct(emptyProductForm(categoryNames[0] || ''));
                          }}
                          className="px-3 py-2 rounded-xl border border-[#DFCFC1] text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-3">
                    <h2 className="text-lg font-bold text-[#4A3B32]">Catálogo Cadastrado</h2>
                    {products.length === 0 ? (
                      <p className="text-sm text-[#6B584C]">Nenhum produto cadastrado ainda.</p>
                    ) : (
                      products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF6F2] border border-[#E8DBD0]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.imagem}
                              alt={prod.nome}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#4A3B32] truncate">{prod.nome}</p>
                              <p className="text-xs text-[#6B584C]">
                                {formatBRL(prod.preco)} • {prod.categoria} •{' '}
                                <span className={prod.ativo ? 'text-[#6A8E96] font-semibold' : 'text-red-500'}>
                                  {prod.ativo ? 'Ativo' : 'Pausado'}
                                </span>
                                {prod.variacoesAtivas && (prod.variacoesVisiveis?.length || 0) > 0 && (
                                  <span className="ml-1.5 text-[#C99649] font-semibold">
                                    • {prod.variacoesVisiveis.length} variação(ões)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(prod)}
                              className="p-2 rounded-lg bg-white border border-[#DFCFC1] hover:bg-[#F3EAE2]"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4 text-[#4A3B32]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleProductActive(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DFCFC1] text-xs font-medium"
                            >
                              {prod.ativo ? 'Pausar' : 'Ativar'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {adminSection === 'config' && (
                <div className="bg-white rounded-2xl border border-[#E6D8CC] p-6 max-w-2xl space-y-4">
                  <h2 className="text-lg font-bold text-[#4A3B32]">Configurações da Vitrine e Frete</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome da marca</label>
                      <input
                        type="text"
                        value={config.nomeLoja}
                        onChange={(e) => handleSaveConfig({ nomeLoja: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frase / Subtítulo</label>
                      <input
                        type="text"
                        value={config.subtitulo}
                        onChange={(e) => handleSaveConfig({ subtitulo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frete base (R$)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={config.freteBase}
                        onChange={(e) =>
                          handleSaveConfig({ freteBase: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frete grátis acima de (R$)</label>
                      <input
                        type="number"
                        step="5"
                        value={config.freteGratisAcima}
                        onChange={(e) =>
                          handleSaveConfig({ freteGratisAcima: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-40 flex justify-end bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FAF6F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5D7CA]"
          >
            <div className="p-5 border-b border-[#E5D7CA] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D48C84]" />
                <h2 className="font-bold text-base text-[#4A3B32]">Sua Sacola</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3EAE2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-medium text-[#6B584C]">Sua sacola está vazia.</p>
                  <p className="text-xs text-[#8B7669]">Adicione itens da vitrine para calcular o frete.</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.cartKey}
                      className="bg-white p-3 rounded-2xl border border-[#E8DBD0] flex items-center gap-3"
                    >
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#4A3B32] line-clamp-2">{item.nome}</p>
                        <p className="text-xs text-[#6B584C]">{formatBRL(item.preco)} cada</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.cartKey, -1)}
                            className="w-6 h-6 rounded-md bg-[#F3EAE2] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.cartKey, 1)}
                            className="w-6 h-6 rounded-md bg-[#F3EAE2] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.cartKey)}
                        className="p-1.5 text-[#9A877B] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <form
                    onSubmit={handleCalcularFrete}
                    className="bg-white p-4 rounded-2xl border border-[#E8DBD0] space-y-2"
                  >
                    <label className="block text-xs font-semibold text-[#4A3B32]">
                      Calcular frete por CEP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cepInput}
                        onChange={(e) => setCepInput(e.target.value)}
                        placeholder="00000-000"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-[#6A8E96] text-white text-xs font-semibold"
                      >
                        Calcular
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-[#E5D7CA] space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#6B584C]">
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B584C]">
                    <span>Frete</span>
                    <span>{freteAtual === 0 ? 'Grátis' : formatBRL(freteAtual)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#4A3B32] pt-2 border-t border-[#F3ECE5]">
                    <span>Total</span>
                    <span>{formatBRL(totalCarrinho)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="w-full bg-[#D48C84] hover:bg-[#c47971] text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <span>Concluir Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

{isCheckoutOpen && (
        <div
          onClick={() => {
            setIsCheckoutOpen(false);
            setPendingOrder(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#E6D8CC] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#F3ECE5] pb-3">
              <h2
                className="text-2xl font-semibold text-[#4A3B32]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {pendingOrder ? `Pedido ${pendingOrder.id}` : 'Finalizar Encomenda'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setPendingOrder(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#FAF6F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!pendingOrder ? (
              <form onSubmit={handleCreatePixOrder} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#D48C84]" /> Seu nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.clienteNome}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, clienteNome: e.target.value })}
                    placeholder="Ex.: Mariana Souza"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#6A8E96]" /> WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.clienteWhatsapp}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, clienteWhatsapp: e.target.value })
                      }
                      placeholder="(12) 99999-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#C99649]" /> E-mail (comprovante Pix)
                    </label>
                    <input
                      type="email"
                      required
                      value={checkoutForm.clienteEmail}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, clienteEmail: e.target.value })
                      }
                      placeholder="voce@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">CEP</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.clienteCep}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clienteCep: e.target.value })}
                      placeholder="12300-000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Endereço de entrega{' '}
                      {lookingUpCep && (
                        <span className="text-[#6A8E96] font-normal">(buscando logradouro...)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.clienteEndereco}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIsAddressManuallyEdited(val.trim() !== '');
                        setCheckoutForm({ ...checkoutForm, clienteEndereco: val });
                      }}
                      placeholder="Rua, bairro, cidade"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Número</label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={checkoutForm.clienteNumero}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '');
                        setCheckoutForm({ ...checkoutForm, clienteNumero: onlyDigits });
                      }}
                      placeholder="Ex.: 120"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Complemento <span className="text-[#8B7669] font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.clienteComplemento}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, clienteComplemento: e.target.value })
                      }
                      placeholder="Ex.: Apto 42, Bloco B, Cond. Sol"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F2] border border-[#E8DBD0] flex items-center justify-between text-sm">
                  <span className="font-medium text-[#6B584C]">Total a pagar via Pix:</span>
                  <strong className="text-lg text-[#4A3B32]">{formatBRL(totalCarrinho)}</strong>
                </div>

                <button
                  type="submit"
                  disabled={savingAction}
                  className="w-full bg-[#4A3B32] hover:bg-[#352922] text-[#FAF6F2] py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <QrCode className="w-4 h-4 text-[#C99649]" />
                  <span>{savingAction ? 'Gerando Pix...' : 'Gerar QR Code Pix'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF1F3] text-[#4E6E75]">
                  <span>Status: {pendingOrder.status}</span>
                </div>

                {pendingOrder.qrCodeBase64 ? (
                  <div className="mx-auto w-48 h-48 rounded-2xl border border-[#E6D8CC] bg-white p-2 flex items-center justify-center shadow-sm">
                    <img
                      src={`data:image/png;base64,${pendingOrder.qrCodeBase64}`}
                      alt="QR Code Pix Mercado Pago"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mx-auto w-40 h-40 rounded-2xl border-2 border-dashed border-[#C99649] bg-[#FAF6F2] flex flex-col items-center justify-center p-3">
                    <QrCode className="w-20 h-20 text-[#4A3B32]" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <p className="text-base font-bold text-[#4A3B32]">
                    Valor: {formatBRL(pendingOrder.total)}
                  </p>
                  <p className="text-[11px] text-[#7C685B] bg-[#FAF6F2] border border-[#E8DBD0] rounded-xl px-3 py-1.5 inline-block">
                    Loja: <strong className="text-[#4A3B32]">{config.nomeLoja}</strong> • Recebedor no banco: titular do ateliê (Mônica)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Código Pix Copia e Cola copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#6A8E96]" />
                      <span>Copiar código Pix Copia e Cola</span>
                    </>
                  )}
                </button>

                {pendingOrder.status === 'Aguardando Pagamento' ? (
                  <p className="text-xs text-[#6B584C]">
                    Abra o app do seu banco e pague o Pix. Assim que o pagamento for confirmado pelo Mercado Pago, esta tela atualiza automaticamente.
                  </p>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-semibold">
                      Pagamento confirmado! Anote o código <strong>{pendingOrder.id}</strong> para acompanhar o envio.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-[#E8DBD0] py-6 px-4 text-center text-xs text-[#7C685B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>{config.nomeLoja}</strong> — {config.subtitulo}
          </span>
          <span>Vitrine artesanal • Supabase + Mercado Pago</span>
        </div>
      </footer>

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl p-3 border border-[#E6D8CC] shadow-2xl flex flex-col items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="self-end px-3 py-1 rounded-lg bg-[#4A3B32] text-[#FAF6F2] text-xs font-semibold hover:bg-[#352922]"
            >
              Fechar
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
