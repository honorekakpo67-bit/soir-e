import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  CameraIcon,
  CameraOffIcon,
  CheckCircle2Icon,
  KeyboardIcon,
  ScanLineIcon,
  XCircleIcon } from
'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/Button';
import { inputClasses } from '../../components/ui/Field';
import { formatDateTime, formatTime } from '../../utils/format';
import { ScanResult } from '../../types';

const READER_ID = 'josegem-qr-reader';

const outcomeStyles: Record<
  ScanResult['outcome'],
  {title: string;className: string;icon: React.ElementType;}> =
{
  valid: {
    title: 'Billet validé',
    className: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
    icon: CheckCircle2Icon
  },
  'already-used': {
    title: 'Déjà scanné',
    className: 'border-amber-400/40 bg-amber-400/15 text-amber-100',
    icon: AlertTriangleIcon
  },
  'not-found': {
    title: 'Billet inconnu',
    className: 'border-red-400/40 bg-red-500/15 text-red-100',
    icon: XCircleIcon
  },
  'wrong-event': {
    title: 'Mauvais événement',
    className: 'border-red-400/40 bg-red-500/15 text-red-100',
    icon: XCircleIcon
  }
};

export function AdminScan() {
  const { events, scanCode, tickets } = useApp();
  const upcoming = events.filter((event) => event.published);
  const [eventId, setEventId] = useState<string>('all');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockRef = useRef<string>('');

  const handleCode = useCallback(
    (code: string) => {
      if (lockRef.current === code) return;
      lockRef.current = code;
      window.setTimeout(() => {
        lockRef.current = '';
      }, 2500);
      const outcome = scanCode(code, eventId === 'all' ? undefined : eventId);
      setResult(outcome);
      setHistory((prev) => [outcome, ...prev].slice(0, 12));
      if (navigator.vibrate) navigator.vibrate(outcome.outcome === 'valid' ? 60 : [40, 60, 40]);
    },
    [eventId, scanCode]
  );

  const handleCodeRef = useRef(handleCode);
  useEffect(() => {
    handleCodeRef.current = handleCode;
  }, [handleCode]);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.stop();
      await scanner.clear();
    } catch {

      /* déjà arrêté */}
    scannerRef.current = null;
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleCodeRef.current(decoded),
        () => undefined
      );
      setScanning(true);
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setCameraError(
        "Impossible d'accéder à la caméra. Autorise l'accès dans le navigateur ou saisis le code à la main."
      );
    }
  }, []);

  useEffect(
    () => () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => undefined);
      }
    },
    []
  );

  const scannedToday = tickets.filter(
    (ticket) =>
    ticket.scannedAt && new Date(ticket.scannedAt).toDateString() === new Date().toDateString()
  ).length;

  const active = result ? outcomeStyles[result.outcome] : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Scanner à l&apos;entrée</h1>
          <p className="mt-1 text-sm text-white/50">
            Chaque QR code n&apos;est validable qu&apos;une seule fois · {scannedToday} entrées aujourd&apos;hui
          </p>
        </div>
        <select
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          aria-label="Événement contrôlé"
          className="self-start rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-blush/50 focus:outline-none">
          
          <option value="all" className="bg-night-800">
            Tous les événements
          </option>
          {upcoming.map((event) =>
          <option key={event.id} value={event.id} className="bg-night-800">
              {event.title}
            </option>
          )}
        </select>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="glass overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-night-800">
            <div id={READER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

            {!scanning ?
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full border border-blush/60" />
                  <CameraIcon className="h-8 w-8 text-white/70" />
                </span>
                <p className="text-sm text-white/55">
                  Active la caméra arrière pour scanner les QR codes des invités.
                </p>
                <Button onClick={startCamera}>
                  <ScanLineIcon className="h-4 w-4" /> Démarrer le scan
                </Button>
              </div> :

            <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56 rounded-3xl border-2 border-white/70">
                    <motion.span
                    className="absolute inset-x-2 h-0.5 rounded-full bg-sunset shadow-glow"
                    animate={{ top: ['6%', '92%', '6%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
                  
                  </div>
                </div>
                <button
                type="button"
                onClick={stopCamera}
                className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-night-900/85 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md">
                
                  <CameraOffIcon className="h-4 w-4" /> Arrêter
                </button>
              </>
            }
          </div>

          {cameraError ?
          <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {cameraError}
            </p> :
          null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!manual.trim()) return;
              handleCode(manual.trim().toUpperCase());
              setManual('');
            }}
            className="mt-5 flex flex-col gap-3 sm:flex-row">
            
            <div className="relative flex-1">
              <KeyboardIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={manual}
                onChange={(event) => setManual(event.target.value.toUpperCase())}
                placeholder="NVA-XXXX-XXXX"
                aria-label="Saisir un code billet manuellement"
                className={`${inputClasses} pl-11 font-mono`} />
              
            </div>
            <Button type="submit" variant="outline" className="h-12">
              Valider le code
            </Button>
          </form>
        </section>

        <section className="space-y-5">
          <AnimatePresence mode="wait">
            {result && active ?
            <motion.div
              key={`${result.code}-${result.at}`}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`rounded-3xl border p-6 ${active.className}`}>
              
                <active.icon className="h-10 w-10" />
                <h2 className="mt-3 font-display text-2xl font-bold">{active.title}</h2>
                <p className="mt-1 font-mono text-sm opacity-80">{result.code}</p>
                {result.ticket ?
              <dl className="mt-4 space-y-1.5 text-sm opacity-90">
                    <div className="flex justify-between gap-4">
                      <dt>Titulaire</dt>
                      <dd className="font-medium">{result.ticket.buyerName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Entrées</dt>
                      <dd className="font-medium">{result.ticket.quantity}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Événement</dt>
                      <dd className="truncate font-medium">{result.event?.title ?? '—'}</dd>
                    </div>
                    {result.outcome === 'already-used' && result.ticket.scannedAt ?
                <div className="flex justify-between gap-4">
                        <dt>Scanné à</dt>
                        <dd className="font-medium">{formatDateTime(result.ticket.scannedAt)}</dd>
                      </div> :
                null}
                  </dl> :

              <p className="mt-3 text-sm opacity-85">
                    Ce code ne correspond à aucun billet enregistré.
                  </p>
              }
              </motion.div> :

            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-3xl p-6 text-center">
              
                <ScanLineIcon className="mx-auto h-9 w-9 text-white/35" />
                <p className="mt-3 font-display text-lg font-semibold text-white">En attente d&apos;un scan</p>
                <p className="mt-1 text-sm text-white/45">
                  Le résultat s&apos;affichera ici, en grand, dès qu&apos;un QR code est lu.
                </p>
              </motion.div>
            }
          </AnimatePresence>

          <div className="glass rounded-3xl p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Derniers scans</h2>
            {history.length ?
            <ul className="divide-y divide-white/10">
                {history.map((item, index) =>
              <li key={`${item.code}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-white/80">{item.code}</p>
                      <p className="truncate text-xs text-white/40">
                        {item.ticket?.buyerName ?? 'Inconnu'} · {formatTime(item.at)}
                      </p>
                    </div>
                    <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  item.outcome === 'valid' ?
                  'bg-emerald-400/15 text-emerald-200' :
                  item.outcome === 'already-used' ?
                  'bg-amber-400/15 text-amber-100' :
                  'bg-red-500/15 text-red-200'}`
                  }>
                  
                      {outcomeStyles[item.outcome].title}
                    </span>
                  </li>
              )}
              </ul> :

            <p className="text-sm text-white/40">Aucun scan pour le moment.</p>
            }
          </div>
        </section>
      </div>
    </div>);

}