import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { InstagramIcon, MenuIcon, SparklesIcon, TicketIcon, XIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const navLinks = [
{ to: '/#evenements', label: 'Événements' },
{ to: '/#comment', label: 'Comment ça marche' },
{ to: '/#faq', label: 'FAQ' }];


export function PublicLayout() {
  const { settings } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-night-900">
      <div className="pointer-events-none fixed inset-0 aurora opacity-80" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
          'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'120\' height=\'120\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'
        }} />
      

      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-night-900/60 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:h-20">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
                <SparklesIcon className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                {settings.brandName}
                <span className="text-gradient"> Events</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
              {navLinks.map((link) =>
              <a
                key={link.to}
                href={link.to}
                className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                
                  {link.label}
                </a>
              )}
              <NavLink
                to="/admin"
                className="ml-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white">
                
                Espace organisateur
              </NavLink>
            </nav>

            <button
              type="button"
              className="rounded-full p-2 text-white md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>
              
              {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>

          {open ?
          <div className="border-t border-white/10 bg-night-800/95 px-5 py-4 md:hidden">
              <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
                {navLinks.map((link) =>
              <a
                key={link.to}
                href={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/10">
                
                    {link.label}
                  </a>
              )}
                <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/10">
                
                  Espace organisateur
                </Link>
              </nav>
            </div> :
          null}
        </header>

        <main key={location.pathname} className="relative">
          <Outlet />
        </main>

        <footer className="relative border-t border-white/10 bg-night-900/70 px-5 py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </span>
                <span className="font-display text-lg font-bold text-white">{settings.brandName} Events</span>
              </div>
              <p className="max-w-xs text-sm text-white/50">
                Soirées, fêtes et voyages toute l&apos;année. Billetterie sans compte : ton QR code, c&apos;est
                ton billet.
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Découvrir</h2>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="/#evenements" className="hover:text-white">
                    Tous les événements
                  </a>
                </li>
                <li>
                  <a href="/#comment" className="hover:text-white">
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-white">
                    Questions fréquentes
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Billets</h2>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <TicketIcon className="h-4 w-4 text-sunset" /> Paiement sécurisé fedaPay
                </li>
                <li>Aucun compte requis</li>
                <li>QR code instantané</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Contact</h2>
              <p className="text-sm text-white/60">{settings.contactEmail}</p>
              <a
                href="https://instagram.com"
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
                
                <InstagramIcon className="h-4 w-4" /> @josegem.events
              </a>
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-6xl border-t border-white/10 pt-6 text-xs text-white/35">
            © {new Date().getFullYear()} {settings.brandName} Events · Fait avec beaucoup de soleil.
          </div>
        </footer>
      </div>
    </div>);

}