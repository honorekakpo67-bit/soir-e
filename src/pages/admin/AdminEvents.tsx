import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon } from
'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { EventFormModal } from '../../components/admin/EventFormModal';
import { Button } from '../../components/ui/Button';
import { CATEGORY_LABELS, CATEGORY_STYLES, formatPrice, formatShortDate, formatTime } from '../../utils/format';
import { EventItem } from '../../types';

export function AdminEvents() {
  const { events, soldCount, createEvent, updateEvent, deleteEvent } = useApp();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<{open: boolean;event?: EventItem;}>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<EventItem | null>(null);

  const visible = useMemo(
    () =>
    [...events].
    sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).
    filter((event) =>
    `${event.title} ${event.city} ${event.venue}`.toLowerCase().includes(query.trim().toLowerCase())
    ),
    [events, query]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Événements</h1>
          <p className="mt-1 text-sm text-white/50">
            {events.length} événements · {events.filter((event) => event.published).length} publiés
          </p>
        </div>
        <Button onClick={() => setModal({ open: true })} className="self-start">
          <PlusIcon className="h-4 w-4" /> Nouvel événement
        </Button>
      </header>

      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un événement…"
          aria-label="Rechercher un événement"
          className="glass w-full rounded-full py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-blush/50" />
        
      </div>

      {visible.length === 0 ?
      <div className="glass rounded-2xl px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-white">Aucun événement</p>
          <p className="mt-1 text-sm text-white/50">Crée ta première date pour ouvrir la billetterie.</p>
        </div> :

      <div className="grid gap-4">
          {visible.map((event) => {
          const sold = soldCount(event.id);
          const rate = Math.min(100, Math.round(sold / event.capacity * 100));
          return (
            <article
              key={event.id}
              className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
              
                <img
                src={event.image}
                alt=""
                className="h-32 w-full rounded-xl object-cover sm:h-20 sm:w-32" />
              

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold text-white">{event.title}</h2>
                    <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[event.category]}`}>
                    
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    event.published ?
                    'bg-emerald-400/15 text-emerald-200' :
                    'bg-white/10 text-white/50'}`
                    }>
                    
                      {event.published ?
                    <EyeIcon className="h-3 w-3" /> :

                    <EyeOffIcon className="h-3 w-3" />
                    }
                      {event.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatShortDate(event.date)} · {formatTime(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {event.venue}, {event.city}
                    </span>
                    <span>{formatPrice(event.price)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                      <div className="brand-gradient h-full rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-xs text-white/45">
                      {sold}/{event.capacity} vendus
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                  to={`/evenements/${event.id}`}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white">
                  
                    Voir la page
                  </Link>
                  <button
                  type="button"
                  onClick={() => updateEvent(event.id, { published: !event.published })}
                  className="rounded-xl border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={event.published ? 'Dépublier' : 'Publier'}>
                  
                    {event.published ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                  <button
                  type="button"
                  onClick={() => setModal({ open: true, event })}
                  className="rounded-xl border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Modifier">
                  
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                  type="button"
                  onClick={() => setConfirmDelete(event)}
                  className="rounded-xl border border-red-400/30 p-2 text-red-300 transition hover:bg-red-500/15"
                  aria-label="Supprimer">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </article>);

        })}
        </div>
      }

      {modal.open ?
      <EventFormModal
        initial={modal.event}
        onClose={() => setModal({ open: false })}
        onSubmit={(values) => {
          if (modal.event) {
            updateEvent(modal.event.id, values);
            toast.success('Événement mis à jour');
          } else {
            createEvent(values);
            toast.success('Événement créé');
          }
          setModal({ open: false });
        }} /> :

      null}

      {confirmDelete ?
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/80 p-5 backdrop-blur-sm">
          <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirmer la suppression"
          className="glass-strong w-full max-w-md rounded-3xl p-6">
          
            <h2 className="font-display text-lg font-bold text-white">Supprimer cet événement ?</h2>
            <p className="mt-2 text-sm text-white/55">
              « {confirmDelete.title} » et les {soldCount(confirmDelete.id)} billets associés seront
              définitivement supprimés.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Annuler
              </Button>
              <Button
              variant="danger"
              onClick={() => {
                deleteEvent(confirmDelete.id);
                setConfirmDelete(null);
                toast.success('Événement supprimé');
              }}>
              
                <Trash2Icon className="h-4 w-4" /> Supprimer
              </Button>
            </div>
          </div>
        </div> :
      null}
    </div>);

}