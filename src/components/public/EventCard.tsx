import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { EventItem } from '../../types';
import { CATEGORY_LABELS, CATEGORY_STYLES, formatPrice, formatShortDate, formatTime } from '../../utils/format';

interface EventCardProps {
  event: EventItem;
  sold: number;
  index?: number;
}

export function EventCard({ event, sold, index = 0 }: EventCardProps) {
  const remaining = Math.max(0, event.capacity - sold);
  const soldOut = remaining === 0;
  const fillRate = Math.min(100, Math.round(sold / event.capacity * 100));

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className="group glass relative overflow-hidden rounded-3xl shadow-card transition duration-300 hover:-translate-y-1 hover:border-white/25">
      
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/25 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${CATEGORY_STYLES[event.category]}`}>
          
          {CATEGORY_LABELS[event.category]}
        </span>
        {soldOut ?
        <span className="absolute right-4 top-4 rounded-full bg-night-900/80 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-md">
            Complet
          </span> :
        remaining <= 30 ?
        <span className="absolute right-4 top-4 rounded-full bg-sunset/90 px-3 py-1 text-xs font-semibold text-night-900 backdrop-blur-md">
            Plus que {remaining} places
          </span> :
        null}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-bold leading-tight text-white">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-blush" />
              {formatShortDate(event.date)} · {formatTime(event.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-sunset" />
              {event.city}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="brand-gradient h-full rounded-full" style={{ width: `${fillRate}%` }} />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-white/45">
            <UsersIcon className="h-3.5 w-3.5" />
            {sold} / {event.capacity} billets vendus
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs uppercase tracking-[0.16em] text-white/40">à partir de</span>
            <p className="font-display text-2xl font-bold text-white">{formatPrice(event.price)}</p>
          </div>
          <Link
            to={`/evenements/${event.id}`}
            className="brand-gradient inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            
            Voir <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>);

}