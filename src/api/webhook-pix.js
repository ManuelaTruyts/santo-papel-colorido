import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const paymentId =
    req.body?.data?.id ||
    req.query?.['data.id'] ||
    (req.body?.type === 'payment' ? req.body?.resource : null);

  if (!paymentId || !accessToken) {
    return res.status(200).json({ received: true });
  }

  try {
    const cleanId = String(paymentId).split('/').pop();
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
