import { useEffect, useState } from 'react';
import { Ban, Check, Code2, Copy, ExternalLink, KeyRound, Search, Upload } from 'lucide-react';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'La requête a échoué.');
  return payload;
}

export default function DeveloperPortal({ user, onNotice }) {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState('');
  const [write, setWrite] = useState(false);
  const [issuedKey, setIssuedKey] = useState('');
  const [testKey, setTestKey] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshKeys = async () => {
    try {
      const payload = await request('/api/keys');
      setKeys(payload.keys || []);
    } catch (error) {
      onNotice(error.message);
    }
  };
  useEffect(() => { refreshKeys(); }, []);

  const createKey = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await request('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, write })
      });
      setIssuedKey(payload.apiKey);
      setName('');
      await refreshKeys();
      onNotice('Clé créée. Copiez-la maintenant : elle ne sera plus affichée.');
    } catch (error) {
      onNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id) => {
    if (!window.confirm('Révoquer cette clé ? Les applications qui l’utilisent perdront immédiatement l’accès.')) return;
    setBusy(true);
    try {
      await request(`/api/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refreshKeys();
      onNotice('Clé révoquée.');
    } catch (error) {
      onNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const test = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await request('/api/v1/works?limit=10', { headers: { Authorization: `Bearer ${testKey.trim()}` } });
      setResult(JSON.stringify(payload, null, 2));
      onNotice(`${payload.data?.length || 0} œuvre(s) reçue(s).`);
    } catch (error) {
      onNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const payload = await request('/api/v1/works/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${testKey.trim()}`, 'Content-Type': 'application/json' },
        body: await file.text()
      });
      onNotice(`${payload.imported} œuvre(s) importée(s).`);
    } catch (error) {
      onNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(issuedKey);
      onNotice('Clé copiée.');
    } catch {
      onNotice('Sélectionnez puis copiez la clé affichée.');
    }
  };

  return <div className="page api-page">
    <section className="api-heading"><span className="eyebrow"><Code2 size={14} /> ESPACE DÉVELOPPEUR</span><h1>API FreeDexAn</h1><p>Bonjour {user.name}. Créez une clé API pour utiliser le catalogue depuis votre site ou votre application.</p></section>
    <div className="api-notice"><ShieldCheckIcon /> La documentation de cet espace est réservée aux comptes connectés. Les clés API ne sont montrées qu’une seule fois.</div>
    <div className="api-grid">
      <section className="api-card"><div className="api-card-title"><KeyRound size={19} /><div><h2>Créer une clé</h2><p>Chaque clé appartient à votre compte.</p></div></div>
        <form onSubmit={createKey} className="key-form">
          <label className="field"><span>Nom du projet</span><input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Mon site" /></label>
          <label className="checkbox-row"><input type="checkbox" checked={write} onChange={(event) => setWrite(event.target.checked)} /><span>Autoriser l’import et la modification des œuvres</span></label>
          <button className="button primary" disabled={busy}><KeyRound size={15} /> Générer une clé</button>
        </form>
        {issuedKey && <div className="issued-key"><label>Votre nouvelle clé — visible uniquement maintenant</label><div><input readOnly value={issuedKey} onFocus={(event) => event.target.select()} /><button className="button" onClick={copyKey}><Copy size={14} /> Copier</button></div><small>Gardez-la côté serveur. Ne la publiez jamais dans le code JavaScript de votre site.</small></div>}
      </section>

      <section className="api-card"><div className="api-card-title"><KeyRound size={19} /><div><h2>Vos clés</h2><p>{keys.length} clé(s) active(s)</p></div></div>
        {keys.length ? <div className="key-list">{keys.map((key) => <div className="key-row" key={key.id}><div><strong>{key.name}</strong><span>{key.key_prefix}•••• · {key.scopes?.includes('write') ? 'lecture + écriture' : 'lecture seule'}</span></div><button className="icon-danger" onClick={() => revoke(key.id)} disabled={busy} aria-label={`Révoquer ${key.name}`}><Ban size={16} /></button></div>)}</div> : <p className="empty-inline">Aucune clé pour le moment.</p>}
      </section>
    </div>

    <section className="api-card docs-card"><div className="api-card-title"><Code2 size={19} /><div><h2>Documentation</h2><p>120 requêtes par minute et par clé.</p></div></div>
      <div className="endpoint-list">
        <div><span className="method get">GET</span><code>/api/v1/works?q=naruto&amp;kind=anime&amp;page=1&amp;limit=20</code><p>Recherche parmi le catalogue et les œuvres enregistrées avec votre clé.</p></div>
        <div><span className="method get">GET</span><code>/api/v1/works/:slug</code><p>Fiche détaillée, saisons, versions, épisodes et chapitres.</p></div>
        <div><span className="method post">POST</span><code>/api/v1/works/import</code><p>Importe jusqu’à 500 œuvres JSON. Une clé avec écriture est requise.</p></div>
      </div>
      <pre className="api-code"><code>{`const response = await fetch("https://VOTRE-SITE/api/v1/works?q=naruto", {\n  headers: { Authorization: "Bearer VOTRE_CLE_API" }\n});\nconst catalogue = await response.json();`}</code></pre>
      <div className="docs-footer"><a href="/api/docs" target="_blank" rel="noreferrer">Documentation JSON complète <ExternalLink size={14} /></a><span>Authentification obligatoire pour les données API</span></div>
    </section>

    <section className="api-card test-card"><div className="api-card-title"><Search size={19} /><div><h2>Tester une clé</h2><p>Collez une clé existante pour vérifier son accès.</p></div></div>
      <form className="test-form" onSubmit={test}><label className="field"><span>Clé API</span><input type="password" autoComplete="off" value={testKey} onChange={(event) => setTestKey(event.target.value)} placeholder="moz_…" /></label><div className="button-row"><button className="button" disabled={busy || !testKey.trim()}><Check size={14} /> Tester</button><label className="button upload-button"><Upload size={14} /> Importer un JSON<input type="file" accept=".json,application/json" onChange={importJson} disabled={busy || !testKey.trim()} /></label></div></form>
      {result && <details className="api-result"><summary>Afficher le résultat du test</summary><pre>{result}</pre></details>}
    </section>
  </div>;
}

function ShieldCheckIcon() {
  return <span className="notice-shield"><Check size={14} /></span>;
}
