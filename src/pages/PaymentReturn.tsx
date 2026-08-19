import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, LoaderIcon, RefreshCwIcon, XCircleIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const PENDING_KEY = 'josegem-pending-order';

interface PendingOrder {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  sendEmail: boolean;
}

type Phase = 'checking' | 'creating' | 'done' | 'failed';

export function PaymentReturn() {
  const { eventId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { getEvent, purchase } = useApp();
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState('');

  const event = getEvent(eventId);

  useEffect(() => {
    const transactionId = params.get('id');
    if (!transactionId) {
      setPhase('failed');
      setError("La page de retour de paiement est incomplète (identifiant manquant).");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId })
        });
        const data = (await response.json()) as { approved?: boolean; status?: string; error?: string };
        if (cancelled) return;

        if (!response.ok || !data.approved) {
          setPhase('failed');
          setError(
            data.status === 'canceled'
              ? 'Le paiement a été annulé. Tu peux réessayer.'
              : 'Le paiement n’a pas été confirmé. Réessaie ou contacte le support.'
          );
          return;
        }

        setPhase('creating');
        const raw = window.sessionStorage.getItem(PENDING_KEY);
        const pending: PendingOrder = raw ? JSON.parse(raw) : {
          eventId,
          buyerName: 'Invité',
          buyerEmail: '',
          quantity: 1,
          sendEmail: false
        };

        if (pending.eventId !== eventId) {
          setPhase('failed');
          setError('Les données de la commande ne correspondent pas. Recommence le paiement.');
          return;
        }

        const ticket = purchase({
          eventId: pending.eventId,
          buyerName: pending.buyerName,
          buyerEmail: pending.buyerEmail,
          quantity: pending.quantity,
          sendEmail: pending.sendEmail
        });
        window.sessionStorage.removeItem(PENDING_KEY);
        if (cancelled) return;
        setPhase('done');
        navigate(`/billet/${ticket.code}`, { state: { fresh: true }, replace: true });
      } catch {
        if (cancelled) return;
        setPhase('failed');
        setError('Impossible de vérifier le paiement. Vérifie ta connexion puis réessaie.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, params, navigate, purchase]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 py-28 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong w-full rounded-[2rem] p-8 shadow-glow sm:p-10">

        {phase === 'checking' ?
        <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <LoaderIcon className="h-8 w-8 animate-spin text-white/70" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-white">Vérification du paiement…</h1>
            <p className="mt-2 text-sm text-white/50">
              On confirme ta transaction auprès de fedaPay. Ça ne prend que quelques secondes.
            </p>
          </> :

        phase === 'creating' ?
        <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15">
              <CheckCircle2Icon className="h-8 w-8 text-emerald-300" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-white">Paiement confirmé !</h1>
            <p className="mt-2 text-sm text-white/50">Génération de ton QR code…</p>
          </> :

        phase === 'failed' ?
        <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <XCircleIcon className="h-8 w-8 text-red-300" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-white">Paiement non abouti</h1>
            <p className="mt-2 text-sm text-white/55">{error}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to={event ? `/paiement/${event.id}` : '/'}
                className="brand-gradient inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white">
                
                <RefreshCwIcon className="h-4 w-4" /> Réessayer
              </Link>
              <Link
                to="/"
                className="glass inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white">
                
                Retour à l&apos;accueil
              </Link>
            </div>
          </> :

        null
        }
      </motion.div>
    </div>);

}
