import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarRangeIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  ScanLineIcon,
  SettingsIcon,
  SparklesIcon,
  TicketIcon,
  XIcon } from
'lucide-react';
import { useApp } from '../../contexts/AppContext';

const links = [
{ to: '/admin', label: 'Tableau de bord', icon: LayoutDashboardIcon, end: true },
{ to: '/admin/evenements', label: 'Événements', icon: CalendarRangeIcon, end: false },
{ to: '/admin/billets', label: 'Billets', icon: TicketIcon, end: false },
{ to: '/admin/scan', label: 'Scanner', icon: ScanLineIcon, end: false },
{ to: '/admin/parametres', label: 'Paramètres', icon: SettingsIcon, end: false }];


export function AdminLayout() {
  const { logout, settings } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav =
  <nav className="flex flex-col gap-1" aria-label="Navigation admin">
      {links.map((link) =>
    <NavLink
      key={link.to}
      to={link.to}
      end={link.end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive ?
      'brand-gradient text-white shadow-glow' :
      'text-white/60 hover:bg-white/10 hover:text-white'}`

      }>
      
          <link.icon className="h-[18px] w-[18px]" />
          {link.label}
        </NavLink>
    )}
    </nav>;


  return (
    <div className="flex min-h-screen w-full bg-night-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between border-r border-white/10 bg-night-800/80 p-5 backdrop-blur-xl lg:flex">
        <div className="space-y-8">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl">
              <SparklesIcon className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none text-white">
                {settings.brandName}
              </span>
              <span className="text-xs text-white/40">Console organisateur</span>
            </span>
          </Link>
          {nav}
        </div>

        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-white/10 hover:text-white">
            
            <ExternalLinkIcon className="h-[18px] w-[18px]" /> Voir le site
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-red-500/15 hover:text-red-200">
            
            <LogOutIcon className="h-[18px] w-[18px]" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-night-900/85 px-5 backdrop-blur-xl lg:hidden">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg">
              <SparklesIcon className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-base font-bold text-white">Console</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="rounded-lg p-2 text-white">
            
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </header>

        {open ?
        <div className="border-b border-white/10 bg-night-800/95 p-4 lg:hidden">
            {nav}
            <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-red-500/15 hover:text-red-200">
            
              <LogOutIcon className="h-[18px] w-[18px]" /> Déconnexion
            </button>
          </div> :
        null}

        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-9">
          <Outlet />
        </main>
      </div>
    </div>);

}