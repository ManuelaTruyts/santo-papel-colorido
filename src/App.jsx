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
  const [categoriesList,
