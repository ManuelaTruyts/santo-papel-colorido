import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function verifyMercadoPagoSignature(req, secret, dataId) {
  if (!secret) return true; // Se ainda não estiver configurada, não bloqueia

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  if (!xSignature || !xRequestId || !dataId) return false;

  const parts = String(xSignature).split(',');
  let ts = '';
  let hash = '';

  for (const part of parts) {
    const [key, value] = part.split('=').map((s) => s.trim());
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  }

  if (!ts || !hash) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return expectedHash === hash;
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const rawPaymentId =
    req.query?.['data.id'] ||
    req.body?.data?.id ||
    (req.body?.type === 'payment' ? req.body?.resource : null);

  if (!rawPaymentId || !accessToken) {
    return res.status(200).json({ received: true });
  }

  const cleanId = String(rawPaymentId).split('/').pop();

  if (req.method === 'POST' && webhookSecret) {
    const isValid = verifyMercadoPagoSignature(req, webhookSecret, cleanId);
    if (!isValid) {
      return res.status(401).json({ error: 'Assinatura de webhook inválida' });
    }
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${cleanId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!mpRes.ok) {
      return res.status(200).json({ received: true });
    }

    const payment = await mpRes.json();

    if (payment.status === 'approved' && supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      if (payment.external_reference) {
        await supabaseAdmin
          .from('pedidos')
          .update({ status: 'Em Produção' })
          .eq('codigo_pedido', payment.external_reference)
          .eq('status', 'Aguardando Pagamento');
      } else {
        await supabaseAdmin
          .from('pedidos')
          .update({ status: 'Em Produção' })
          .eq('mp_payment_id', String(payment.id))
          .eq('status', 'Aguardando Pagamento');
      }
    }

    return res.status(200).json({ received: true });
  } catch {
    return res.status(200).json({ received: true });
  }
}
