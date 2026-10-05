import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon, CameraIcon, CameraOffIcon, ScanLineIcon, Loader2Icon, KeyboardIcon, ChevronDownIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const READER_ID = 'qr-reader-main';

const outcomeStyles = {
  valid: {
    title: 'Billet valide',
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

/**
 * QRScanner - A reusable QR code scanner component
 * Uses html5-qrcode for reliable scanning
 * Forces rear camera and handles all error states
 * Validates codes locally using AppContext (no backend needed)
 */
export function QRScanner({ onScanResult, eventId: propEventId }) {
  const { scanCode, events } = useApp();
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [eventId, setEventId] = useState(propEventId || 'all');
  const scannerRef = useRef(null);
  const lockRef = useRef('');
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => undefined);
        scanner.clear().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, []);

  // Fetch available cameras and select rear camera
  const loadCameras = useCallback(async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      setAvailableCameras(cameras);
      
      // Find rear camera (environment facing)
      const rearCamera = cameras.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('rear') || 
        cam.label.toLowerCase().includes('environment') ||
        cam.label.toLowerCase().includes('arrière')
      );
      
      if (rearCamera) {
        setSelectedCameraId(rearCamera.id);
      } else if (cameras.length > 0) {
        // Fallback to first camera
        setSelectedCameraId(cameras[0].id);
      }
    } catch (err) {
      console.error('Failed to get cameras:', err);
    }
  }, []);

  // Load cameras on mount
  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  // Sync eventId from prop
  useEffect(() => {
    if (propEventId) {
      setEventId(propEventId);
    }
  }, [propEventId]);

  const handleCode = useCallback((code) => {
    if (lockRef.current === code) return;
    lockRef.current = code;
    
    // Clear lock after delay to allow re-scanning same code
    window.setTimeout(() => {
      lockRef.current = '';
    }, 2500);

    // Validate locally using AppContext scanCode
    const scanResult = scanCode(code, eventId === 'all' ? undefined : eventId);
    
    if (!isMountedRef.current) return;
    
    setResult(scanResult);
    setShowResult(true);
    
    // Call optional callback
    if (onScanResult) {
      onScanResult(scanResult);
    }

    // Vibrate on mobile for feedback
    if (navigator.vibrate) {
      navigator.vibrate(scanResult.outcome === 'valid' ? 60 : [40, 60, 40]);
    }
  }, [eventId, onScanResult, scanCode]);

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
    } catch (err) {
      console.debug('Camera already stopped:', err);
    }
    scannerRef.current = null;
    setScanning(false);
    setStarting(false);
    setShowResult(false);
    setResult(null);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setStarting(true);
    
    try {
      const readerElement = document.getElementById(READER_ID);
      if (!readerElement) {
        throw new Error('Reader element not found');
      }

      // Check camera permission
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' });
        if (permissions.state === 'denied') {
          setCameraError("L'accès à la caméra est bloqué. Changez les permissions dans les paramètres du navigateur.");
          setStarting(false);
          return;
        }
      } catch (permErr) {
        console.debug('Permission API not available:', permErr);
      }

      const scanner = new Html5Qrcode(READER_ID, { verbose: true });
      scannerRef.current = scanner;

      const startScan = async () => {
        try {
          const config = {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
            disableFlip: true,
            videoConstraints: {
              facingMode: { exact: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };

          // Use specific camera if selected
          if (selectedCameraId) {
            config.videoConstraints.deviceId = { exact: selectedCameraId };
          }

          await scanner.start(
            { facingMode: 'environment' },
            config,
            (decodedText, decodedResult) => {
              console.log('QR Code detected:', decodedText, decodedResult);
              handleCodeRef.current(decodedText);
            },
            (error) => {
              console.debug('QR scan error:', error);
            }
          );
          
          if (!isMountedRef.current) return;
          setScanning(true);
          setStarting(false);
        } catch (startErr) {
          console.error('Failed to start scanner with full config:', startErr);
          
          // Fallback with minimal config
          try {
            await scanner.start(
              { facingMode: 'environment' },
              { fps: 15, qrbox: { width: 280, height: 280 } },
              (decodedText) => handleCodeRef.current(decodedText),
              () => undefined
            );
            if (!isMountedRef.current) return;
            setScanning(true);
            setStarting(false);
          } catch (fallbackErr) {
            console.error('Fallback start failed:', fallbackErr);
            throw fallbackErr;
          }
        }
      };

      await startScan();
    } catch (err) {
      console.error('Failed to start camera:', err);
      scannerRef.current = null;
      if (!isMountedRef.current) return;
      setScanning(false);
      setStarting(false);
      setCameraError(
        "Impossible d'accéder à la caméra. Autorisez l'accès dans le navigateur ou saisissez le code manuellement."
      );
    }
  }, [selectedCameraId]);

  const handleRescan = useCallback(() => {
    setShowResult(false);
    setResult(null);
    // Camera continues scanning automatically
  }, []);

  const handleManualEntry = useCallback((code) => {
    if (code.trim()) {
      handleCodeRef.current(code.trim().toUpperCase());
    }
  }, []);

  // Filter published events for dropdown
  const publishedEvents = events.filter((e) => e.published);

  // Render result overlay
  if (showResult && result) {
    const style = outcomeStyles[result.outcome] || outcomeStyles['not-found'];
    const Icon = style.icon;

    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Scanner à l'entrée</h1>
            <p className="mt-1 text-sm text-white/50">
              Chaque QR code n'est validable qu'une seule fois
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="event-select" className="text-sm text-white/50">Événement :</label>
            <select
              id="event-select"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white focus:border-blush/50 focus:outline-none appearance-none pr-8"
            >
              <option value="all" className="bg-night-800">Tous les événements</option>
              {publishedEvents.map((event) => (
                <option key={event.id} value={event.id} className="bg-night-800">
                  {event.title}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 h-4 w-4 text-white/40 pointer-events-none" />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <section className="glass overflow-hidden rounded-3xl p-5 sm:p-6">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-night-800">
              <div id={READER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10"
                >
                  <Icon className="h-10 w-10" />
                </motion.div>
                
                <h2 className="font-display text-2xl font-bold text-white">{style.title}</h2>
                <p className="font-mono text-sm opacity-80">{result.code}</p>
                
                {result.ticket ? (
                  <dl className="mt-4 space-y-1.5 text-sm opacity-90 w-full max-w-xs">
                    <div className="flex justify-between gap-4">
                      <dt>Titulaire</dt>
                      <dd className="font-medium">{result.ticket.buyerName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Email</dt>
                      <dd className="font-medium truncate">{result.ticket.buyerEmail}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Entrées</dt>
                      <dd className="font-medium">{result.ticket.quantity}</dd>
                    </div>
                    {result.event && (
                      <div className="flex justify-between gap-4">
                        <dt>Événement</dt>
                        <dd className="truncate font-medium">{result.event.title}</dd>
                      </div>
                    )}
                    {result.outcome === 'already-used' && result.ticket.scannedAt && (
                      <div className="flex justify-between gap-4">
                        <dt>Scanné le</dt>
                        <dd className="font-medium">{new Date(result.ticket.scannedAt).toLocaleString('fr-FR')}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm opacity-85">
                    Ce code ne correspond à aucun billet enregistré.
                  </p>
                )}

                <Button 
                  onClick={handleRescan}
                  className="mt-6 w-full sm:w-auto"
                >
                  <ScanLineIcon className="h-4 w-4" /> Scanner un autre ticket
                </Button>
              </div>
            </div>

            {cameraError && (
              <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {cameraError}
              </p>
            )}
          </section>

          <section className="glass rounded-3xl p-6 text-center">
            <ScanLineIcon className="mx-auto h-9 w-9 text-white/35" />
            <p className="mt-3 font-display text-lg font-semibold text-white">Résultat du scan</p>
            <p className="mt-1 text-sm text-white/45">
              Le résultat s'affiche à gauche après chaque scan.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // Render scanner view
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Scanner à l'entrée</h1>
          <p className="mt-1 text-sm text-white/50">
            Chaque QR code n'est validable qu'une seule fois
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {availableCameras.length > 1 && (
            <select
              value={selectedCameraId || ''}
              onChange={(e) => setSelectedCameraId(e.target.value || null)}
              aria-label="Choisir la caméra"
              className="self-start rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-blush/50 focus:outline-none"
            >
              <option value="" className="bg-night-800">Caméra automatique</option>
              {availableCameras.map((cam) => (
                <option key={cam.id} value={cam.id} className="bg-night-800">
                  {cam.label}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="event-select-scanner" className="text-sm text-white/50">Événement :</label>
            <div className="relative">
              <select
                id="event-select-scanner"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white focus:border-blush/50 focus:outline-none appearance-none pr-8"
              >
                <option value="all" className="bg-night-800">Tous les événements</option>
                {publishedEvents.map((event) => (
                  <option key={event.id} value={event.id} className="bg-night-800">
                    {event.title}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="glass overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-night-800">
            <div id={READER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

            {starting ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <Loader2Icon className="h-8 w-8 text-white/70 animate-spin" />
                </span>
                <p className="text-sm text-white/55">Démarrage de la caméra...</p>
              </div>
            ) : !scanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <span className="absolute inset-0 animate-pulse rounded-full border border-blush/60" />
                  <CameraIcon className="h-8 w-8 text-white/70" />
                </span>
                <p className="text-sm text-white/55">
                  Activez la caméra arrière pour scanner les QR codes des invités.
                </p>
                <Button onClick={startCamera}>
                  <ScanLineIcon className="h-4 w-4" /> Démarrer le scan
                </Button>
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56 rounded-3xl border-2 border-white/70">
                    <span
                      className="absolute inset-x-2 h-0.5 rounded-full bg-sunset"
                      style={{
                        animation: 'scanLine 2.6s ease-in-out infinite'
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-night-900/85 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md"
                >
                  <CameraOffIcon className="h-4 w-4" /> Arrêter
                </button>
              </>
            )}
          </div>

          {cameraError && (
            <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {cameraError}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const code = formData.get('code');
              handleManualEntry(code);
              e.target.reset();
            }}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <KeyboardIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                name="code"
                placeholder="JGM-XXXX-XXXX"
                aria-label="Saisir un code billet manuellement"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pl-11 text-white placeholder:text-white/30 focus:border-blush/50 focus:outline-none focus:ring-2 focus:ring-blush/20 font-mono uppercase"
              />
            </div>
            <Button type="submit" variant="outline" className="h-12">
              Valider le code
            </Button>
          </form>
        </section>

        <section className="space-y-5">
          <div className="glass rounded-3xl p-6 text-center">
            <ScanLineIcon className="mx-auto h-9 w-9 text-white/35" />
            <p className="mt-3 font-display text-lg font-semibold text-white">En attente d'un scan</p>
            <p className="mt-1 text-sm text-white/45">
              Le résultat s'affichera ici, en grand, dès qu'un QR code est lu.
            </p>
          </div>
        </section>
      </div>

      {/* Add keyframes for scan line animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 6%; }
          50% { top: 92%; }
          100% { top: 6%; }
        }
      `}</style>
    </div>
  );
}

// Simple Button component for inline use
function Button({ children, onClick, variant = 'primary', className = '', disabled, type = 'button', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'brand-gradient text-white hover:brightness-110 focus:ring-blush/50',
    outline: 'border border-white/20 text-white hover:bg-white/10 focus:ring-white/30',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/30'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import { motion } from 'framer-motion';

export default QRScanner;