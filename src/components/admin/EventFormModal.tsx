import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { EventCategory, EventItem } from '../../types';
import { Field, inputClasses } from '../ui/Field';
import { Button } from '../ui/Button';

interface EventFormModalProps {
  initial?: EventItem;
  onClose: () => void;
  onSubmit: (values: Omit<EventItem, 'id'>) => void;
}

const categories: {value: EventCategory;label: string;}[] = [
{ value: 'soiree', label: 'Soirée' },
{ value: 'fete', label: 'Fête' },
{ value: 'voyage', label: 'Voyage' }];


function toLocalInput(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function EventFormModal({ initial, onClose, onSubmit }: EventFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'soiree');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(toLocalInput(initial?.date));
  const [endDate, setEndDate] = useState(initial?.endDate ? toLocalInput(initial.endDate) : '');
  const [venue, setVenue] = useState(initial?.venue ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? 20));
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 200));
  const [image, setImage] = useState(initial?.image ?? '');
  const [lineup, setLineup] = useState((initial?.lineup ?? []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !venue.trim() || !city.trim() || !date) {
      setError('Titre, lieu, ville et date sont obligatoires.');
      return;
    }
    onSubmit({
      title: title.trim(),
      category,
      description: description.trim(),
      date: new Date(date).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      venue: venue.trim(),
      city: city.trim(),
      price: Number(price) || 0,
      capacity: Number(capacity) || 0,
      image:
      image.trim() || "/78c8c95d-b967-4914-8d28-c6f7c2998013.jpg",

      lineup: lineup.
      split(',').
      map((item) => item.trim()).
      filter(Boolean),
      published,
      featured: initial?.featured ?? false
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night-900/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Modifier l'événement" : 'Créer un événement'}
        className="glass-strong max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-night-800/90 px-6 py-4 backdrop-blur-xl">
          <h2 className="font-display text-lg font-bold text-white">
            {initial ? "Modifier l'événement" : 'Nouvel événement'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
            
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <Field label="Titre" htmlFor="ev-title">
            <input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rooftop Sessions · Sunset #13"
              className={inputClasses} />
            
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie" htmlFor="ev-category">
              <select
                id="ev-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className={inputClasses}>
                
                {categories.map((item) =>
                <option key={item.value} value={item.value} className="bg-night-800">
                    {item.label}
                  </option>
                )}
              </select>
            </Field>
            <Field label="Ville" htmlFor="ev-city">
              <input
                id="ev-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
                className={inputClasses} />
              
            </Field>
          </div>

          <Field label="Lieu" htmlFor="ev-venue">
            <input
              id="ev-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Le Perchoir · Toit-terrasse"
              className={inputClasses} />
            
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Début" htmlFor="ev-date">
              <input
                id="ev-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClasses} [color-scheme:dark]`} />
              
            </Field>
            <Field label="Fin (optionnel)" htmlFor="ev-end">
              <input
                id="ev-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputClasses} [color-scheme:dark]`} />
              
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prix (FCFA)" htmlFor="ev-price">
              <input
                id="ev-price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClasses} />
              
            </Field>
            <Field label="Capacité" htmlFor="ev-capacity">
              <input
                id="ev-capacity"
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={inputClasses} />
              
            </Field>
          </div>

          <Field label="Image (URL)" htmlFor="ev-image" hint="Laisse vide pour utiliser l'image par défaut.">
            <input
              id="ev-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className={inputClasses} />
            
          </Field>

          <Field label="Line-up" htmlFor="ev-lineup" hint="Sépare les artistes par une virgule.">
            <input
              id="ev-lineup"
              value={lineup}
              onChange={(e) => setLineup(e.target.value)}
              placeholder="Lulla, Marc Ozé, Sasha K."
              className={inputClasses} />
            
          </Field>

          <Field label="Description" htmlFor="ev-description">
            <textarea
              id="ev-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="L'ambiance, le programme, les infos importantes…"
              className={`${inputClasses} resize-none`} />
            
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/5 p-4">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-transparent accent-blush" />
            
            <span className="text-sm text-white/70">
              Publier sur le site
              <span className="block text-xs text-white/40">
                Décoche pour préparer l&apos;événement sans le rendre visible.
              </span>
            </span>
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{initial ? 'Enregistrer' : "Créer l'événement"}</Button>
          </div>
        </form>
      </motion.div>
    </div>);

}