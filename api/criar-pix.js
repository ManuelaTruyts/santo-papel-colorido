export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel' });
  }

  const { codigoPedido, valorTotal, clienteNome, clienteEmail } = req.body || {};

  const amount = Number(valorTotal);
  if (!codigoPedido || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Dados do pedido inválidos para gerar o Pix' });
  }

  const nameParts = String(clienteNome || 'Cliente').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'Loja';

  try {
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': `${codigoPedido}-${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: Number(amount.toFixed(2)),
        description: `Santo Papel Colorido - Pedido ${codigoPedido}`,
        payment_method_id: 'pix',
        external_reference: String(codigoPedido),
        notification_url: 'https://santo-papel-colorido.vercel.app/api/webhook-pix',
        payer: {
          email: clienteEmail || 'cliente@santopapelcolorido.com.br',
          first_name: firstName,
          last_name: lastName
        }
      })
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        error: data?.message || 'Erro ao criar pagamento Pix no Mercado Pago'
      });
    }

    const txData = data?.point_of_interaction?.transaction_data || {};

    return res.status(200).json({
      paymentId: String(data.id),
      status: data.status,
      qrCodeCopiaECola: txData.qr_code || '',
      qrCodeBase64: txData.qr_code_base64 || ''
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Erro interno ao processar cobrança Pix'
    });
  }
}
