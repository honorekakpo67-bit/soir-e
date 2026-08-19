import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { seedEvents } from '../src/data/events';
import { seedTickets } from '../src/data/tickets';
import { ScanResult } from '../src/types';

export const runtime = 'nodejs';

const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY ?? 'sk_sandbox_VT6I8V0RnNZSV_SEujyRecTY';
const FEDAPAY_BASE_URL = process.env.FEDAPAY_BASE_URL ?? 'https://sandbox-api.fedapay.com/v1';

const app = new Hono();

const usedCodes = new Map<string, string>();

const EUR_TO_XOF = 655.957;

function unwrapTransaction(json: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!json) return null;
  const wrapped = json['v1/transaction'];
  return (wrapped && typeof wrapped === 'object' ? wrapped : json) as Record<string, unknown>;
}

function toFedapayAmount(amount: number, iso: string): { amount: number; iso: string } {
  let target = iso.toUpperCase();
  let value = amount;
  if (target === 'EUR') {
    value = amount * EUR_TO_XOF;
    target = 'XOF';
  }
  const noMinorUnits = ['XOF', 'XAF', 'XPF', 'GNF', 'KMF'].includes(target);
  return noMinorUnits ? { amount: Math.round(value), iso: target } : { amount: Math.round(value * 100), iso: target };
}

async function fedapayRequest(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${FEDAPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'X-Api-Version': '1.0',
      ...(init.headers ?? {})
    }
  });
}

app.get('/api/health', (c) => c.json({ ok: true, tickets: seedTickets.length }));

app.post('/api/scan', async (c) => {
  const body = (await c.req.json().catch(() => null)) as { code?: string; eventId?: string } | null;
  const code = String(body?.code ?? '').trim().toUpperCase();
  const eventId = body?.eventId ? String(body.eventId) : undefined;
  const at = new Date().toISOString();

  if (!code) return c.json({ outcome: 'not-found', code, at } as ScanResult, 400);

  const ticket = seedTickets.find((item) => item.code.toUpperCase() === code);
  if (!ticket) return c.json({ outcome: 'not-found', code, at } as ScanResult);

  const event = seedEvents.find((item) => item.id === ticket.eventId);
  if (eventId && ticket.eventId !== eventId) {
    return c.json({ outcome: 'wrong-event', code, ticket, event, at } as ScanResult);
  }

  const scannedAt = usedCodes.get(code) ?? ticket.scannedAt;
  if (ticket.status === 'used' || scannedAt) {
    return c.json({
      outcome: 'already-used',
      code,
      ticket: { ...ticket, status: 'used', scannedAt },
      event,
      at
    } as ScanResult);
  }

  usedCodes.set(code, at);
  return c.json({
    outcome: 'valid',
    code,
    ticket: { ...ticket, status: 'used', scannedAt: at },
    event,
    at
  } as ScanResult);
});

app.post('/api/payments/checkout', async (c) => {
  const body = (await c.req.json().catch(() => null)) as {
    eventId?: string;
    buyerName?: string;
    buyerEmail?: string;
    quantity?: number;
    amount?: number;
    currency?: string;
    origin?: string;
  } | null;

  const eventId = String(body?.eventId ?? '');
  const buyerName = String(body?.buyerName ?? '').trim();
  const buyerEmail = String(body?.buyerEmail ?? '').trim().toLowerCase();
  const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));
  const amount = Number(body?.amount);
  const currency = String(body?.currency ?? 'XOF').toUpperCase();
  let origin = String(body?.origin ?? '').replace(/\/$/, '');
  if (!origin) {
    const reqUrl = new URL(c.req.url);
    origin = `${reqUrl.protocol}//${reqUrl.host}`;
  }

  if (!eventId || !buyerName || !buyerEmail || !amount || amount <= 0) {
    return c.json({ error: 'Données de commande invalides.' }, 400);
  }

  const [firstname = buyerName, ...rest] = buyerName.split(' ');
  const lastname = rest.join(' ') || firstname;
  const callbackUrl = `${origin}/paiement/${eventId}/retour`;
  const fedapayAmount = toFedapayAmount(amount, currency);

  const created = await fedapayRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      description: `${quantity} billet${quantity > 1 ? 's' : ''} · ${eventId}`,
      amount: fedapayAmount.amount,
      currency: { iso: fedapayAmount.iso },
      callback_url: callbackUrl,
      customer: {
        firstname,
        lastname,
        email: buyerEmail
      }
    })
  });

  const createdJson = unwrapTransaction((await created.json().catch(() => null)) as Record<string, unknown> | null);
  const transactionId = createdJson?.id;
  if (!created.ok || !transactionId) {
    return c.json({ error: 'Impossible de créer la transaction fedaPay.', details: createdJson }, 502);
  }

  const tokenRes = await fedapayRequest(`/transactions/${transactionId}/token`, { method: 'POST' });
  const tokenJson = (await tokenRes.json().catch(() => null)) as { url?: string; token?: string } | null;
  const paymentUrl = tokenJson?.url;
  if (!tokenRes.ok || !paymentUrl) {
    return c.json({ error: 'Impossible de générer le lien de paiement.', details: tokenJson }, 502);
  }

  return c.json({ transactionId, paymentUrl });
});

app.post('/api/payments/confirm', async (c) => {
  const body = (await c.req.json().catch(() => null)) as { transactionId?: number | string } | null;
  const transactionId = String(body?.transactionId ?? '').trim();
  if (!transactionId) return c.json({ approved: false, error: 'Identifiant manquant.' }, 400);

  let res = await fedapayRequest(`/transactions/${transactionId}`, { method: 'GET' });
  let json = unwrapTransaction((await res.json().catch(() => null)) as Record<string, unknown> | null);
  let status = String(json?.status ?? 'unknown');

  if (res.ok && status === 'pending') {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      res = await fedapayRequest(`/transactions/${transactionId}`, { method: 'GET' });
      json = unwrapTransaction((await res.json().catch(() => null)) as Record<string, unknown> | null);
      status = String(json?.status ?? 'unknown');
      if (!res.ok || status !== 'pending') break;
    }
  }

  if (!res.ok) {
    return c.json({ approved: false, status, error: 'Impossible de vérifier la transaction.' }, 502);
  }

  return c.json({ approved: status === 'approved', status, reference: json?.reference });
});

export default app;

export const GET = handle(app);
export const POST = handle(app);
