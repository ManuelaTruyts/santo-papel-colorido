export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel' });
  }

  try {
    const { codigoPedido, valorTotal, clienteNome, clienteEmail } = req.body || {};
    const amount = Number(valorTotal);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido para cobrança Pix' });
    }

    const nameParts = String(clienteNome || 'Cliente').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Santo Papel';

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const notificationUrl = host ? `${protocol}://${host}/api/webhook-pix` : undefined;

    const idempotencyKey = `${codigoPedido || 'PED'}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        transaction_amount: Number(amount.toFixed(2)),
        description: `Pedido ${codigoPedido || ''} - Santo Papel Colorido`.trim(),
        payment_method_id: 'pix',
        external_reference: codigoPedido || '',
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
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
      qrCodeCopiaECola: txData.qr_code || '',
      qrCodeBase64: txData.qr_code_base64 || ''
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno ao gerar Pix' });
  }
}
