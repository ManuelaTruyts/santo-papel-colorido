import React, { useState, useEffect, useMemo } from 'react';
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
  Tag
} from 'lucide-react';

const STORAGE_KEY = 'santo_papel_colorido_v1';

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    nome: 'Topo de Bolo Jardim Encantado',
    descricao: 'Camadas em papel fotográfico de alta gramatura com detalhes florais e acabamento manual delicado.',
    preco: 48.0,
    categoria: 'Topos de Bolo',
    prazo: '4 dias úteis',
    imagem: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80',
    ativo: true
  },
  {
    id: 'prod-2',
    nome: 'Caixa Convite Padrinhos Aquarela',
    descricao: 'Caixa rígida com laço em fita de cetim e cartão interno personalizado para celebrações especiais.',
    preco: 34.9,
    categoria: 'Lembrancinhas',
    prazo: '7 dias úteis',
    imagem: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
    ativo: true
  },
  {
    id: 'prod-3',
    nome: 'Kit Festa Afetiva (25 peças)',
    descricao: 'Conjunto coordenado com topper de bolo, tags para doces, forminhas e bandeirolas artesanais.',
    preco: 129.0,
    categoria: 'Kits Festa',
    prazo: '6 dias úteis',
    imagem: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    ativo: true
  },
  {
    id: 'prod-4',
    nome: 'Cartões de Agradecimento & Tags (50 un.)',
    descricao: 'Impressão nítida em papel texturizado ideal para acompanhar encomendas, presentes e kits criativos.',
    preco: 42.0,
    categoria: 'Papelaria Corporativa',
    prazo: '3 dias úteis',
    imagem: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    ativo: true
  }
];

const INITIAL_CONFIG = {
  nomeLoja: 'Santo Papel Colorido',
  subtitulo: 'Detalhes que encantam',
  whatsapp: '5512999999999',
  chavePix: 'contato@santopapelcolorido.com.br',
  freteBase: 16.0,
  freteGratisAcima: 180.0
};

const INITIAL_ORDERS = [
  {
    id: 'PED-1042',
    clienteNome: 'Camila Andrade',
    clienteWhatsapp: '(12) 99123-4567',
    clienteCep: '12300-000',
    clienteEndereco: 'Rua das Flores, 145 - Centro, Jacareí - SP',
    itens: [
      { id: 'prod-1', nome: 'Topo de Bolo Jardim Encantado', quantidade: 1, preco: 48.0 }
    ],
    subtotal: 48.0,
    frete: 16.0,
    total: 64.0,
    status: 'Em Produção',
    codigoRastreio: '',
    criadoEm: 'Hoje, 10:15'
  },
  {
    id: 'PED-1041',
    clienteNome: 'Fernanda Oliveira',
    clienteWhatsapp: '(11) 98877-6655',
    clienteCep: '01310-100',
    clienteEndereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    itens: [
      { id: 'prod-3', nome: 'Kit Festa Afetiva (25 peças)', quantidade: 1, preco: 129.0 },
      { id: 'prod-4', nome: 'Cartões de Agradecimento & Tags (50 un.)', quantidade: 1, preco: 42.0 }
    ],
    subtotal: 171.0,
    frete: 16.0,
    total: 187.0,
    status: 'Enviado',
    codigoRastreio: 'AA987654321BR',
    criadoEm: 'Ontem, 16:40'
  }
];

const STATUS_STEPS = ['Aguardando Pagamento', 'Em Produção', 'Enviado', 'Concluído'];
const CATEGORIES = ['Todos', 'Topos de Bolo', 'Lembrancinhas', 'Kits Festa', 'Papelaria Corporativa'];

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
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

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
          orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
          config: { ...INITIAL_CONFIG, ...(parsed.config || {}) }
        };
      }
    } catch {
      // ignora erro de leitura inicial
    }
    return {
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      config: INITIAL_CONFIG
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignora erro de escrita
    }
  }, [state]);

  // Navegação principal: 'vitrine' | 'rastreio' | 'admin'
  const [activeTab, setActiveTab] = useState('vitrine');

  // Vitrine
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [freteCalculado, setFreteCalculado] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Checkout & Pix
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    clienteNome: '',
    clienteWhatsapp: '',
    clienteCep: '',
    clienteEndereco: ''
  });
  const [pendingOrder, setPendingOrder] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Rastreio do cliente
  const [trackingQuery, setTrackingQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSection, setAdminSection] = useState('resumo');
  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'Topos de Bolo',
    prazo: '5 dias úteis',
    imagem: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 2800);
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
    [cart]
  );

  const freteAtual = useMemo(() => {
    if (cart.length === 0) return 0;
    if (subtotal >= state.config.freteGratisAcima) return 0;
    if (freteCalculado !== null) return freteCalculado;
    return state.config.freteBase;
  }, [cart.length, subtotal, state.config.freteGratisAcima, state.config.freteBase, freteCalculado]);

  const totalCarrinho = subtotal + freteAtual;
  const totalItensCarrinho = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const filteredProducts = useMemo(() => {
    return state.products.filter((prod) => {
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
  }, [state.products, selectedCategory, searchTerm]);

  const metrics = useMemo(() => {
    const validOrders = state.orders.filter((o) => o.status !== 'Aguardando Pagamento');
    const faturamento = validOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const vendasCount = validOrders.length;
    const ticketMedio = vendasCount > 0 ? faturamento / vendasCount : 0;
    const emProducao = state.orders.filter((o) => o.status === 'Em Produção').length;
    return { faturamento, vendasCount, ticketMedio, emProducao };
  }, [state.orders]);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          nome: product.nome,
          preco: product.preco,
          imagem: product.imagem,
          quantidade: 1
        }
      ];
    });
    showToast(`"${product.nome}" adicionado à sacola`);
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantidade: Math.max(0, item.quantidade + delta) } : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCalcularFrete = (e) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      showToast('Digite um CEP válido com 8 números');
      return;
    }
    if (subtotal >= state.config.freteGratisAcima) {
      setFreteCalculado(0);
      showToast('Parabéns! Você ganhou frete grátis');
      return;
    }
    const lastDigit = Number(cleanCep[cleanCep.length - 1]);
    const variacao = lastDigit % 2 === 0 ? 0 : 4;
    const valorFinal = Number(state.config.freteBase) + variacao;
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

  const handleCreatePixOrder = (e) => {
    e.preventDefault();
    if (!checkoutForm.clienteNome.trim() || !checkoutForm.clienteWhatsapp.trim()) {
      showToast('Preencha nome e WhatsApp para gerar o pedido');
      return;
    }

    const randomNum = Math.floor(1050 + Math.random() * 8900);
    const newOrder = {
      id: `PED-${randomNum}`,
      clienteNome: checkoutForm.clienteNome.trim(),
      clienteWhatsapp: checkoutForm.clienteWhatsapp.trim(),
      clienteCep: checkoutForm.clienteCep.trim() || '12300-000',
      clienteEndereco: checkoutForm.clienteEndereco.trim() || 'Retirada / A combinar',
      itens: cart.map((item) => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco
      })),
      subtotal,
      frete: freteAtual,
      total: totalCarrinho,
      status: 'Aguardando Pagamento',
      codigoRastreio: '',
      criadoEm: 'Agora mesmo'
    };

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders]
    }));
    setPendingOrder(newOrder);
    setCart([]);
    setFreteCalculado(null);
  };

  const handleSimulatePixPaid = () => {
    if (!pendingOrder) return;
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((ord) =>
        ord.id === pendingOrder.id ? { ...ord, status: 'Em Produção' } : ord
      )
    }));
    setPendingOrder((prev) => (prev ? { ...prev, status: 'Em Produção' } : null));
    showToast(`Pagamento do pedido ${pendingOrder.id} aprovado! Entrou em produção.`);
  };

  const handleCopyPix = () => {
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${state.config.chavePix}5204000053039865802BR5920SANTO PAPEL COLORIDO6009JACAREI62070503***6304`;
    navigator.clipboard?.writeText(pixCode).catch(() => {});
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSearchOrder = (e) => {
    e.preventDefault();
    const term = trackingQuery.trim().toLowerCase();
    setTrackingSearched(true);
    if (!term) {
      setFoundOrder(null);
      return;
    }
    const match = state.orders.find(
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

  const handleOrderStatusChange = (orderId, nextStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    }));
    if (foundOrder?.id === orderId) {
      setFoundOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    showToast(`Status do pedido ${orderId} atualizado para "${nextStatus}"`);
  };

  const handleTrackingCodeChange = (orderId, code) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, codigoRastreio: code } : o))
    }));
    if (foundOrder?.id === orderId) {
      setFoundOrder((prev) => (prev ? { ...prev, codigoRastreio: code } : null));
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const precoNum = parseFloat(String(newProduct.preco).replace(',', '.'));
    if (!newProduct.nome.trim() || isNaN(precoNum) || precoNum <= 0) {
      showToast('Preencha nome e preço válido do produto');
      return;
    }

    if (editingProductId) {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                nome: newProduct.nome.trim(),
                descricao: newProduct.descricao.trim() || 'Peça artesanal personalizada.',
                preco: precoNum,
                categoria: newProduct.categoria,
                prazo: newProduct.prazo || '5 dias úteis',
                imagem: newProduct.imagem.trim() || p.imagem
              }
            : p
        )
      }));
      setEditingProductId(null);
      showToast('Produto atualizado na vitrine!');
    } else {
      const created = {
        id: `prod-${Date.now()}`,
        nome: newProduct.nome.trim(),
        descricao: newProduct.descricao.trim() || 'Peça artesanal personalizada.',
        preco: precoNum,
        categoria: newProduct.categoria,
        prazo: newProduct.prazo || '5 dias úteis',
        imagem:
          newProduct.imagem.trim() ||
          'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
        ativo: true
      };
      setState((prev) => ({
        ...prev,
        products: [created, ...prev.products]
      }));
      showToast('Novo produto cadastrado na vitrine!');
    }

    setNewProduct({
      nome: '',
      descricao: '',
      preco: '',
      categoria: 'Topos de Bolo',
      prazo: '5 dias úteis',
      imagem: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'
    });
  };

  const handleStartEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setNewProduct({
      nome: prod.nome,
      descricao: prod.descricao,
      preco: String(prod.preco),
      categoria: prod.categoria,
      prazo: prod.prazo,
      imagem: prod.imagem
    });
  };

  const handleToggleProductActive = (id) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    }));
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

      {/* Toast de feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#4A3B32] text-[#FAF6F2] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm border border-[#C99649]/40">
          <Sparkles className="w-4 h-4 text-[#C99649] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Barra Superior / Navegação */}
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

      {/* ABA 1: VITRINE */}
      {activeTab === 'vitrine' && (
        <main className="flex-1">
          {/* Banner Editorial */}
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
                  {state.config.nomeLoja} — {state.config.subtitulo}
                </h1>
                <p className="text-sm sm:text-base text-[#6B584C] leading-relaxed">
                  Escolha suas peças, calcule o frete, finalize o pagamento com Pix e acompanhe cada etapa da produção até a entrega em um só lugar.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B584C]">
                  <span className="bg-white/80 border border-[#E6D8CC] px-3 py-1.5 rounded-lg">
                    Frete grátis acima de <strong>{formatBRL(state.config.freteGratisAcima)}</strong>
                  </span>
                  <span className="bg-white/80 border border-[#E6D8CC] px-3 py-1.5 rounded-lg">
                    Pedido exemplo para testar rastreio: <strong>PED-1041</strong>
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

          {/* Filtros e Busca */}
          <section className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
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
                  placeholder="Buscar topo, kit, lembrancinha..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E5D7CA] text-sm focus:outline-none focus:border-[#D48C84]"
                />
              </div>
            </div>
          </section>

          {/* Grade de Produtos */}
          <section className="max-w-6xl mx-auto px-4 pb-14">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5D7CA] p-10 text-center space-y-2">
                <p className="font-semibold text-base">Nenhum item encontrado com esse filtro.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setSearchTerm('');
                  }}
                  className="text-sm text-[#D48C84] font-semibold underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
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

                      <div className="p-4 space-y-2">
                        <h2
                          className="text-xl font-semibold text-[#4A3B32] leading-snug"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                          {product.nome}
                        </h2>
                        <p className="text-xs text-[#6B584C] line-clamp-2 leading-relaxed">
                          {product.descricao}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6A8E96] font-medium pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Prazo: {product.prazo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-[#F3ECE5] flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[11px] text-[#8B7669]">Valor unitário</span>
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
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ABA 2: ACOMPANHAR PEDIDO */}
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
                Digite o código do pedido (ex.: <strong>PED-1041</strong> ou <strong>PED-1042</strong>) ou o WhatsApp cadastrado.
              </p>
            </div>

            <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Ex.: PED-1041 ou (11) 98877-6655"
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
                Nenhum pedido encontrado para &ldquo;{trackingQuery}&rdquo;. Tente consultar <strong>PED-1041</strong> ou faça um pedido na vitrine.
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

                {/* Linha do tempo das 4 etapas */}
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

      {/* ABA 3: PAINEL ADMINISTRATIVO */}
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
                  <p className="text-xs text-[#6B584C]">Gestão de vendas, catálogo e rastreio</p>
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
              {/* Cabeçalho Admin */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6D8CC]">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-semibold text-[#4A3B32]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Painel Administrativo — {state.config.nomeLoja}
                  </h1>
                  <p className="text-xs text-[#6B584C]">
                    Acompanhe métricas, atualize status/rastreio dos pedidos e cadastre produtos.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'resumo', label: 'Visão Geral & Pedidos', icon: TrendingUp },
                    { id: 'produtos', label: 'Produtos', icon: Tag },
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
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#6B584C] hover:bg-[#F3EAE2] flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>

              {/* Cards de Métricas */}
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

              {/* Seção Pedidos */}
              {adminSection === 'resumo' && (
                <div className="bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-4">
                  <h2 className="text-lg font-bold text-[#4A3B32]">Pedidos e Rastreio</h2>

                  <div className="space-y-3">
                    {state.orders.map((order) => (
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
                            {order.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')} •{' '}
                            <strong>Total: {formatBRL(order.total)}</strong>
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
                </div>
              )}

              {/* Seção Produtos */}
              {adminSection === 'produtos' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <form
                    onSubmit={handleSaveProduct}
                    className="bg-white rounded-2xl border border-[#E6D8CC] p-5 space-y-3 h-fit"
                  >
                    <h2 className="text-lg font-bold text-[#4A3B32]">
                      {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                    </h2>

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
                          value={newProduct.categoria}
                          onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                        >
                          {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
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

                    <div>
                      <label className="block text-xs font-semibold mb-1">URL da foto</label>
                      <input
                        type="text"
                        value={newProduct.imagem}
                        onChange={(e) => setNewProduct({ ...newProduct, imagem: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
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
                        className="flex-1 bg-[#D48C84] hover:bg-[#c37971] text-white py-2.5 rounded-xl text-xs font-semibold transition"
                      >
                        {editingProductId ? 'Salvar Alterações' : 'Adicionar à Vitrine'}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setNewProduct({
                              nome: '',
                              descricao: '',
                              preco: '',
                              categoria: 'Topos de Bolo',
                              prazo: '5 dias úteis',
                              imagem:
                                'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80'
                            });
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
                    {state.products.map((prod) => (
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
                            onClick={() => handleToggleProductActive(prod.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DFCFC1] text-xs font-medium"
                          >
                            {prod.ativo ? 'Pausar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção Configurações */}
              {adminSection === 'config' && (
                <div className="bg-white rounded-2xl border border-[#E6D8CC] p-6 max-w-2xl space-y-4">
                  <h2 className="text-lg font-bold text-[#4A3B32]">Configurações da Vitrine e Frete</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome da marca</label>
                      <input
                        type="text"
                        value={state.config.nomeLoja}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            config: { ...prev.config, nomeLoja: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frase / Subtítulo</label>
                      <input
                        type="text"
                        value={state.config.subtitulo}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            config: { ...prev.config, subtitulo: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frete base (R$)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={state.config.freteBase}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            config: { ...prev.config, freteBase: Number(e.target.value) || 0 }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Frete grátis acima de (R$)</label>
                      <input
                        type="number"
                        step="5"
                        value={state.config.freteGratisAcima}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            config: { ...prev.config, freteGratisAcima: Number(e.target.value) || 0 }
                          }))
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

      {/* Gaveta Lateral da Sacola */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="w-full max-w-md bg-[#FAF6F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#E5D7CA]">
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
                      key={item.id}
                      className="bg-white p-3 rounded-2xl border border-[#E8DBD0] flex items-center gap-3"
                    >
                      <img
                        src={item.imagem}
                        alt={item.nome}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#4A3B32] truncate">{item.nome}</p>
                        <p className="text-xs text-[#6B584C]">{formatBRL(item.preco)} cada</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#F3EAE2] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantidade}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#F3EAE2] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1.5 text-[#9A877B] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Calculadora de Frete */}
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

      {/* Modal de Checkout & Pix */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#E6D8CC] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
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
                    <label className="block text-xs font-semibold mb-1">CEP</label>
                    <input
                      type="text"
                      value={checkoutForm.clienteCep}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clienteCep: e.target.value })}
                      placeholder="12300-000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Endereço de entrega</label>
                  <input
                    type="text"
                    value={checkoutForm.clienteEndereco}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, clienteEndereco: e.target.value })
                    }
                    placeholder="Rua, número, bairro, cidade"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCFC1] bg-[#FAF6F2] text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F2] border border-[#E8DBD0] flex items-center justify-between text-sm">
                  <span className="font-medium text-[#6B584C]">Total a pagar via Pix:</span>
                  <strong className="text-lg text-[#4A3B32]">{formatBRL(totalCarrinho)}</strong>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#4A3B32] hover:bg-[#352922] text-[#FAF6F2] py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#C99649]" />
                  <span>Gerar Código Pix</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF1F3] text-[#4E6E75]">
                  <span>Status atual: {pendingOrder.status}</span>
                </div>

                <div className="mx-auto w-40 h-40 rounded-2xl border-2 border-dashed border-[#C99649] bg-[#FAF6F2] flex flex-col items-center justify-center p-3">
                  <QrCode className="w-20 h-20 text-[#4A3B32]" />
                  <span className="text-[11px] font-bold text-[#4A3B32] mt-1">
                    {formatBRL(pendingOrder.total)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#DFCFC1] bg-[#
