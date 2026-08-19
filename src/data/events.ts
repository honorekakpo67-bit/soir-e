import { EventItem } from '../types';

export const seedEvents: EventItem[] = [
{
  id: 'evt_rooftop',
  title: 'Rooftop Sessions · Sunset #12',
  category: 'soiree',
  description:
  "La soirée qui a lancé JOSEGEM. Cinq heures de house solaire au dernier étage, coucher de soleil sur les toits, cocktails signature et un line-up 100% local. Dress code : léger, coloré, prêt à danser jusqu'à la fermeture.",
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
  description:
  "Un festival d'une journée en plein air : trois scènes, food trucks, terrain de pétanque et un final aux confettis quand le soleil tombe. L'événement le plus attendu de l'été.",
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
  description:
  "Départ du Vieux-Port à 17h, cap sur les calanques. Baignade, apéro au large, DJ set sur le pont supérieur et retour au port sous les étoiles. Places très limitées.",
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
  description:
  "Transats, guirlandes lumineuses et sélection downtempo les pieds dans le sable. Une soirée douce pour finir l'été en beauté, avec un bar à fruits frais et une session live guitare.",
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
  description:
  "Retour dans l'entrepôt : 800 m² de béton brut, un mur de son calibré et des lasers jusqu'à l'aube. Techno mélodique et sélection maison. Ouverture des portes à 23h.",
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
}];