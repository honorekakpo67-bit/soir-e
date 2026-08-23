import { Hono } from 'hono';
import { handle } from 'hono/vercel';

export const runtime = 'nodejs';

const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY ?? 'sk_sandbox_VT6I8V0RnNZSV_SEujyRecTY';
const FEDAPAY_BASE_URL = process.env.FEDAPAY_BASE_URL ?? 'https://sandbox-api.fedapay.com/v1';

const app = new Hono();

const usedCodes = new Map<string, string>();

const EUR_TO_XOF = 655.957;

interface EventItem {
  id: string;
  title: string;
  category: 'soiree' | 'fete' | 'voyage';
  description: string;
  date: string;
  endDate?: string;
  venue: string;
  city: string;
  price: number;
  capacity: number;
  image: string;
  lineup: string[];
  published: boolean;
  featured: boolean;
}

interface Ticket {
  id: string;
  code: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  amount: number;
  purchasedAt: string;
  status: 'valid' | 'used';
  scannedAt?: string;
  emailSent: boolean;
}

type ScanOutcome = 'valid' | 'already-used' | 'not-found' | 'wrong-event';

interface ScanResult {
  outcome: ScanOutcome;
  code: string;
  ticket?: Ticket;
  event?: EventItem;
  at: string;
}

const seedEvents: EventItem[] = [
  {
    id: 'evt_rooftop',
    title: 'Rooftop Sessions · Sunset #12',
    category: 'soiree',
    description: "La soirée qui a lancé JOSEGEM. Cinq heures de house solaire au dernier étage, coucher de soleil sur les toits, cocktails signature et un line-up 100% local. Dress code : léger, coloré, prêt à danser jusqu'à la fermeture.",
    date: '2026-08-22T20:00:00.000Z',
    endDate: '2026-08-23T03:00:00.000Z',
    venue: 'Le Perchoir · Toit-terrasse',
    city: 'Paris',
    price: 15743,
    capacity: 320,
    image: "/78c8c95d-b967-4914-8d28-c6f7c2998013.jpg",
    lineup: ['Lulla', 'Marc Ozé', 'Sasha K.', 'JOSEGEM Residents'],
    published: true,
    featured: true
  },
  {
    id: 'evt_openair',
    title: 'JOSEGEM Open Air · Édition Coucher de Soleil',
    category: 'fete',
    description: "Un festival d'une journée en plein air : trois scènes, food trucks, terrain de pétanque et un final aux confettis quand le soleil tombe. L'événement le plus attendu de l'été.",
    date: '2026-09-05T15:00:00.000Z',
    endDate: '2026-09-06T02:00:00.000Z',
    venue: 'Parc des Lumières',
    city: 'Montpellier',
    price: 25582,
    capacity: 1800,
    image: "/81af1119-2f2a-4deb-9915-59deb7aea4a2.jpg",
    lineup: ['Alma Sol', 'Dorian & Wave', 'Club Papaya', 'Nina Ferrer', 'Bloom'],
    published: true,
    featured: false
  },
  {
    id: 'evt_boat',
    title: 'Sunset Boat Party · Îles du Frioul',
    category: 'voyage',
    description: "Départ du Vieux-Port à 17h, cap sur les calanques. Baignade, apéro au large, DJ set sur le pont supérieur et retour au port sous les étoiles. Places très limitées.",
    date: '2026-08-29T17:00:00.000Z',
    endDate: '2026-08-29T23:30:00.000Z',
    venue: 'Vieux-Port · Quai de la Fraternité',
    city: 'Marseille',
    price: 38701,
    capacity: 120,
    image: "/1711b1d1-3859-47bc-95c4-c449f53fa348.jpg",
    lineup: ['Selva', 'Jules Marin'],
    published: true,
    featured: false
  },
  {
    id: 'evt_beach',
    title: 'Chill Beach Club · Golden Hour',
    category: 'soiree',
    description: "Transats, guirlandes lumineuses et sélection downtempo les pieds dans le sable. Une soirée douce pour finir l'été en beauté, avec un bar à fruits frais et une session live guitare.",
    date: '2026-09-19T18:00:00.000Z',
    endDate: '2026-09-20T01:00:00.000Z',
    venue: 'La Playa · Plage de la Salis',
    city: 'Antibes',
    price: 11807,
    capacity: 260,
    image: "/f57ad109-b478-43db-a3ea-c595f8fee3d7.jpg",
    lineup: ['Solène', 'Barka', 'Duo Marée'],
    published: true,
    featured: false
  },
  {
    id: 'evt_warehouse',
    title: 'Warehouse JOSEGEM · Nuit Laser',
    category: 'fete',
    description: "Retour dans l'entrepôt : 800 m² de béton brut, un mur de son calibré et des lasers jusqu'à l'aube. Techno mélodique et sélection maison. Ouverture des portes à 23h.",
    date: '2026-10-10T22:00:00.000Z',
    endDate: '2026-10-11T06:00:00.000Z',
    venue: 'Hangar 14 · Docks Nord',
    city: 'Lyon',
    price: 19023,
    capacity: 900,
    image: "/b9436a87-c8f0-437d-92e7-b654bc4e4da8.jpg",
    lineup: ['Kessler', 'Anaïs Void', 'Tempo Rouge'],
    published: true,
    featured: false
  }
];

const buyers: [string, string][] = [
  ['Camille Rousseau', 'camille.rousseau@mail.com'],
  ['Yanis Belkacem', 'yanis.b@mail.com'],
  ['Lou Fabre', 'lou.fabre@mail.com'],
  ['Marta Silva', 'marta.silva@mail.com'],
  ['Théo Nguyen', 'theo.nguyen@mail.com'],
  ['Inès Barbier', 'ines.barbier@mail.com'],
  ['Hugo Lemaire', 'hugo.lemaire@mail.com'],
  ['Sofia Marchetti', 'sofia.m@mail.com'],
  ['Noé Perrin', 'noe.perrin@mail.com'],
  ['Jade Coulibaly', 'jade.c@mail.com'],
  ['Elias Roche', 'elias.roche@mail.com'],
  ['Manon Dupuis', 'manon.dupuis@mail.com']
];

const eventIds = ['evt_rooftop', 'evt_openair', 'evt_boat', 'evt_beach', 'evt_warehouse'];
const prices: Record<string, number> = {
  evt_rooftop: 15743,
  evt_openair: 25582,
  evt_boat: 38701,
  evt_beach: 11807,
  evt_warehouse: 19023
};

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function seededCode(seed: number): string {
  let out = '';
  let value = seed * 9301 + 49297;
  for (let i = 0; i < 8; i += 1) {
    value = (value * 9301 + 49297) % 233280;
    out += ALPHABET[value % ALPHABET.length];
    if (i === 3) out += '-';
  }
  return `JGM-${out}`;
}

const seedTickets: Ticket[] = Array.from({ length: 46 }).map((_, index) => {
  const [buyerName, buyerEmail] = buyers[index % buyers.length];
  const eventId = eventIds[index % eventIds.length];
  const quantity = index % 7 === 0 ? 2 : 1;
  const daysAgo = index % 21 + 1;
  const purchasedAt = new Date(Date.UTC(2026, 7, 9, 12, 0, 0) - daysAgo * 86_400_000 - index * 3_600_000);
  const used = index % 5 === 0;
  return {
    id: `tkt_seed_${index + 1}`,
    code: seededCode(index + 7),
    eventId,
    buyerName,
    buyerEmail,
    quantity,
    amount: prices[eventId] * quantity,
    purchasedAt: purchasedAt.toISOString(),
    status: used ? 'used' : 'valid',
    scannedAt: used ? new Date(purchasedAt.getTime() + 86_400_000).toISOString() : undefined,
    emailSent: index % 9 !== 0
  };
});

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
