import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  UserIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Field, inputClasses } from '../components/ui/Field';
import { formatPrice, formatShortDate, formatTime } from '../utils/format';

interface FormErrors {
  name?: string;
  email?: string;
}

const PENDING_KEY = 'josegem-pending-order';

export function Checkout() {
  const { eventId = '' } = useParams();
  const { getEvent, soldCount, settings } = useApp();
  const event = getEvent(eventId);

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [processing, setProcessing] = useState(false);

  if (!event) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-5 py-32 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Événement introuvable</h1>
        <Link
          to="/"
          className="brand-gradient inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white">
          
          Retour à l&apos;accueil
        </Link>
      </div>);

  }

  const remaining = Math.max(0, event.capacity - soldCount(event.id));
  const maxQuantity = Math.max(1, Math.min(6, remaining));
  const subtotal = event.price * quantity;
  const fees = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + fees;

  function validate(): boolean {
    const next: FormErrors = {};
    if (name.trim().length < 2) next.name = 'Indique ton nom complet.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Email invalide.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    if (!validate() || !event) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          buyerName: name,
          buyerEmail: email,
          quantity,
          amount: total,
          currency: settings.currency,
          origin: window.location.origin
        })
      });
      const data = (await response.json()) as { transactionId?: number; paymentUrl?: string; error?: string };
      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.error ?? 'Impossible de lancer le paiement.');
      }
      window.sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ eventId: event.id, buyerName: name, buyerEmail: email, quantity, sendEmail })
      );
      window.location.href = data.paymentUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Le paiement a échoué. Réessaie.');
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <Link
        to={`/evenements/${event.id}`}
        className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/75 transition hover:text-white">
        
        <ArrowLeftIcon className="h-4 w-4" /> Retour à l&apos;événement
      </Link>

      <div className="mb-8 flex items-center gap-3 text-sm">
        {['Événement', 'Paiement', 'QR code'].map((step, index) =>
        <React.Fragment key={step}>
            <span
            className={`flex items-center gap-2 ${index <= 1 ? 'text-white' : 'text-white/35'}`}>
            
              <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              index < 1 ?
              'bg-white/15 text-white' :
              index === 1 ?
              'brand-gradient text-white' :
              'border border-white/20 text-white/40'}`
              }>
              
                {index < 1 ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </span>
            {index < 2 ? <span className="h-px flex-1 bg-white/15" /> : null}
          </React.Fragment>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate>
          
          <section className="glass rounded-3xl p-6 sm:p-7">
            <h1 className="font-display text-xl font-bold text-white">Tes informations</h1>
            <p className="mt-1 text-sm text-white/50">
              Aucun compte à créer. On a juste besoin de ton nom et de ton email pour t&apos;envoyer le QR
              code.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" htmlFor="name" error={errors.name}>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Camille Rousseau"
                    autoComplete="name"
                    className={`${inputClasses} pl-11`} />
                  
                </div>
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email}>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="camille@email.com"
                    autoComplete="email"
                    className={`${inputClasses} pl-11`} />
                  
                </div>
              </Field>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                Nombre de billets
              </p>
              <div className="flex items-center gap-4">
                <div className="glass flex items-center gap-1 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Retirer un billet"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30">
                    
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-display text-lg font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                    aria-label="Ajouter un billet"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-30">
                    
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/45">
                  Un seul QR code est généré pour {quantity > 1 ? `les ${quantity} entrées` : 'ton entrée'}.
                </p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-white/5 p-4">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent accent-blush" />
              
              <span className="text-sm text-white/70">
                M&apos;envoyer aussi le QR code par email
                <span className="block text-xs text-white/40">
                  Recommandé — tu pourras le retrouver même sans le télécharger.
                </span>
              </span>
            </label>
          </section>

          <section className="glass rounded-3xl p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                <CreditCardIcon className="h-5 w-5 text-blush" /> Paiement
              </h2>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                <LockIcon className="h-3 w-3" /> fedaPay · {settings.payMode === 'test' ? 'Test' : 'Live'}
              </span>
            </div>

            <p className="mt-4 text-sm text-white/55">
              Au moment de payer, tu seras redirigé vers la page sécurisée de fedaPay
              {settings.payMode === 'test' ? ' (environnement de test)' : ''}. Une fois le paiement
              confirmé, ton QR code est généré instantanément.
            </p>

            <button
              type="submit"
              disabled={processing}
              className="brand-gradient mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-70">
              
              {processing ?
              <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Redirection vers fedaPay…
                </> :

              <>
                  <LockIcon className="h-4 w-4" /> Payer {formatPrice(total)}
                </>
              }
            </button>
            <p className="mt-3 text-center text-xs text-white/40">
              Paiement sécurisé par fedaPay. Le QR code arrive juste après la confirmation.
            </p>
          </section>
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="lg:sticky lg:top-28 lg:self-start">
          
          <div className="glass-strong overflow-hidden rounded-3xl">
            <img src={event.image} alt={event.title} className="h-36 w-full object-cover" />
            <div className="space-y-4 p-6">
              <h2 className="font-display text-lg font-bold leading-tight text-white">{event.title}</h2>
              <div className="space-y-1.5 text-sm text-white/55">
                <p className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blush" />
                  {formatShortDate(event.date)} · {formatTime(event.date)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-sunset" />
                  {event.venue}, {event.city}
                </p>
              </div>

              <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-white/60">
                  <dt>
                    {quantity} × billet {formatPrice(event.price)}
                  </dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-white/60">
                  <dt>Frais de service</dt>
                  <dd>{formatPrice(fees)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 font-display text-lg font-bold text-white">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>);

}
