import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, MailIcon, RotateCcwIcon, SaveIcon, ShieldCheckIcon, StoreIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/Button';
import { Field, inputClasses } from '../../components/ui/Field';

export function AdminSettings() {
  const { settings, updateSettings, resetDemoData } = useApp();
  const [form, setForm] = useState(settings);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    updateSettings(form);
    toast.success('Paramètres enregistrés');
  }

  function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setPasswordError('8 caractères minimum.');
      return;
    }
    if (password !== confirm) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordError('');
    setPassword('');
    setConfirm('');
    toast.success('Mot de passe administrateur mis à jour');
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Paramètres</h1>
        <p className="mt-1 text-sm text-white/50">Billetterie, paiement et accès administrateur.</p>
      </header>

      <form onSubmit={handleSave} className="glass space-y-5 rounded-2xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <StoreIcon className="h-5 w-5 text-blush" /> Billetterie
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la marque" htmlFor="brand">
            <input
              id="brand"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className={inputClasses} />
            
          </Field>
          <Field label="Email de contact" htmlFor="contact">
            <input
              id="contact"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className={inputClasses} />
            
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/5 p-4">
          <input
            type="checkbox"
            checked={form.autoSendEmail}
            onChange={(e) => setForm({ ...form, autoSendEmail: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent accent-blush" />
          
          <span className="text-sm text-white/70">
            <span className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-sunset" /> Envoi automatique du QR code par email
            </span>
            <span className="mt-1 block text-xs text-white/40">
              L&apos;acheteur reçoit son billet dès la confirmation du paiement.
            </span>
          </span>
        </label>

        <h2 className="flex items-center gap-2 border-t border-white/10 pt-5 font-display text-lg font-bold text-white">
          <ShieldCheckIcon className="h-5 w-5 text-blush" /> Paiement fedaPay
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mode" htmlFor="mode">
            <select
              id="mode"
              value={form.payMode}
              onChange={(e) => setForm({ ...form, payMode: e.target.value as 'test' | 'live' })}
              className={inputClasses}>
              
              <option value="test" className="bg-night-800">
                Test (sandbox)
              </option>
              <option value="live" className="bg-night-800">
                Production
              </option>
            </select>
          </Field>
          <Field label="Clé publique" htmlFor="fedapay-public-key">
            <input
              id="fedapay-public-key"
              value={form.fedapayPublicKey}
              onChange={(e) => setForm({ ...form, fedapayPublicKey: e.target.value })}
              className={`${inputClasses} font-mono text-xs`} />
            
          </Field>
        </div>
        <Field label="Clé secrète (serveur)" htmlFor="fedapay-secret-key">
          <input
            id="fedapay-secret-key"
            type="password"
            value={form.fedapaySecretKey}
            onChange={(e) => setForm({ ...form, fedapaySecretKey: e.target.value })}
            className={`${inputClasses} font-mono text-xs`} />
          
        </Field>

        <div className="flex justify-end pt-2">
          <Button type="submit">
            <SaveIcon className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </form>

      <form onSubmit={handlePassword} className="glass space-y-5 rounded-2xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <KeyRoundIcon className="h-5 w-5 text-blush" /> Compte administrateur
        </h2>
        <p className="-mt-2 text-sm text-white/50">
          Un seul compte a accès à la console : <span className="text-white/75">{settings.adminEmail}</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nouveau mot de passe" htmlFor="pwd">
            <input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClasses} />
            
          </Field>
          <Field label="Confirmation" htmlFor="pwd2" error={passwordError}>
            <input
              id="pwd2"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputClasses} />
            
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="outline">
            Mettre à jour le mot de passe
          </Button>
        </div>
      </form>

      <section className="space-y-4 rounded-2xl border border-red-400/25 bg-red-500/5 p-6">
        <h2 className="font-display text-lg font-bold text-white">Zone sensible</h2>
        <p className="text-sm text-white/50">
          Réinitialise les événements, les billets et les paramètres avec le jeu de données de démonstration.
          Cette action est irréversible.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            resetDemoData();
            toast.success('Données de démonstration restaurées');
          }}>
          
          <RotateCcwIcon className="h-4 w-4" /> Réinitialiser les données
        </Button>
      </section>
    </div>);

}