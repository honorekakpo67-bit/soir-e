import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, SparklesIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Field, inputClasses } from '../../components/ui/Field';

export function AdminLogin() {
  const { login, isAdmin } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@josegem.fr');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 700));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/admin', { replace: true });
    } else {
      setError('Identifiants incorrects. Réessaie.');
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-night-900 px-5 py-12">
      <div className="pointer-events-none absolute inset-0 aurora opacity-80" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md">
        
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          
          <ArrowLeftIcon className="h-4 w-4" /> Retour au site
        </Link>

        <div className="glass-strong rounded-[2rem] p-7 shadow-glow sm:p-9">
          <span className="brand-gradient mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-glow">
            <SparklesIcon className="h-6 w-6 text-white" />
          </span>
          <h1 className="font-display text-2xl font-bold text-white">Console organisateur</h1>
          <p className="mt-1.5 text-sm text-white/50">
            Accès réservé. Un seul compte administrateur est autorisé.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <Field label="Email" htmlFor="admin-email">
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  className={`${inputClasses} pl-11`} />
                
              </div>
            </Field>

            <Field label="Mot de passe" htmlFor="admin-password" error={error}>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  id="admin-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputClasses} pl-11 pr-11`} />
                
                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 hover:text-white">
                  
                  {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="brand-gradient flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70">
              
              {loading ?
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> :

              'Se connecter'
              }
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/50">
            <p className="font-semibold text-white/70">Accès démo</p>
            <p className="mt-1">admin@josegem.fr · josegem2026</p>
          </div>
        </div>
      </motion.div>
    </div>);

}