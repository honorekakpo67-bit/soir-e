import { Ticket } from '../types';

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
['Manon Dupuis', 'manon.dupuis@mail.com']];


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

export const seedTickets: Ticket[] = Array.from({ length: 46 }).map((_, index) => {
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