import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight,
  Code2, ExternalLink, Film, KeyRound, LogIn, LogOut, Search, ShieldCheck, Tv, UserPlus, X
} from 'lucide-react';
import DeveloperPortal from './DeveloperPortal.jsx';
import './styles.css';

const kinds = [
  { id: 'all', label: 'Tout' },
  { id: 'anime', label: 'Animés' },
  { id: 'webtoon', label: 'Webtoons' },
  { id: 'scan', label: 'Scans' },
  { id: 'film', label: 'Films' }
];

const kindLabel = (kind) => ({
  anime: 'Animé',
  film: 'Film',
  webtoon: 'Webtoon',
  scan: 'Scan'
}[kind] || 'Animé');

const safeUrl = (value) => {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const episodesFor = (version) => version?.readers?.flatMap((reader) => reader.episodes || []) || [];
const episodeName = (version, index) => version?.episodeNames?.[index] || `Épisode ${index + 1}`;

function App() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState('catalog');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [reader, setReader] = useState(null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/anime-sama/catalogue').then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Le catalogue est indisponible.');
        return payload;
      }),
      fetch('/api/auth/me').then((response) => response.json())
    ]).then(([catalogue, session]) => {
      if (!active) return;
      setWorks(catalogue.items || []);
      setUser(session.user || null);
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      setLoadError(error.message || 'Impossible de charger le catalogue.');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const route = window.location.hash.replace(/^#\/?/, '');
      if (route === 'api') {
        setPage('api');
        setSelected(null);
        setReader(null);
      } else if (route.startsWith('work/')) {
        setPage('detail');
      } else {
        setPage('catalog');
        setSelected(null);
        setReader(null);
      }
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const filtered = useMemo(() => works.filter((work) => {
    const text = `${work.name || ''} ${work.description || ''} ${(work.genres || []).join(' ')}`.toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase())
      && (kind === 'all' || (work.kind || 'anime') === kind);
  }), [works, query, kind]);

  const go = (destination) => {
    window.location.hash = destination;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWork = async (work) => {
    setSelected(work);
    setReader(null);
    setDetailError('');
    setPage('detail');
    window.location.hash = `work/${encodeURIComponent(work.slug || work.id)}`;
    if (!work.sourceUrl) return;
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/anime-sama/work?url=${encodeURIComponent(work.sourceUrl)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'La fiche détaillée ne peut pas être chargée.');
      setSelected((current) => current?.id === work.id ? { ...current, ...payload, kind: work.kind || payload.kind } : current);
    } catch (error) {
      setDetailError(error.message || 'Impossible de charger les détails.');
    } finally {
      setDetailLoading(false);
    }
  };

  const openChapter = async (chapter) => {
    const entry = typeof chapter === 'string' ? { url: chapter } : chapter;
    const pages = entry.pages || entry.pageUrls || entry.images || [];
    if (pages.length) {
      setReader({ ...entry, pages });
      return;
    }
    const chapterUrl = safeUrl(entry.url || entry.sourceUrl);
    if (!chapterUrl) {
      setNotice('Cette fiche ne fournit pas de pages lisibles.');
      return;
    }
    try {
      const host = new URL(chapterUrl).hostname;
      if (!['anime-sama.to', 'www.anime-sama.to'].includes(host)) {
        setNotice('La source ne fournit pas encore de pages intégrables.');
        return;
      }
      const response = await fetch(`/api/anime-sama/chapter?url=${encodeURIComponent(chapterUrl)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Les pages de ce chapitre ne sont pas disponibles.');
      setReader({ ...entry, ...payload, pages: payload.pages || [] });
    } catch (error) {
      setNotice(error.message || 'Impossible de charger les pages du chapitre.');
    }
  };

  const authRequest = async (event, mode) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      name: String(form.get('name') || '')
    };
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Connexion impossible.');
      setUser(payload.user);
      setAuthMode('');
      setNotice(mode === 'signup' ? 'Compte créé. Vous avez accès à l’espace API.' : 'Vous êtes connecté.');
      if (page === 'api') go('api');
    } catch (error) {
      setNotice(error.message || 'Une erreur est survenue.');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setPage('catalog');
    setSelected(null);
    go('catalog');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go('catalog')} aria-label="Accueil">
          <span className="brand-mark">F</span><span>FREEDEX<span className="brand-light">AN</span></span>
        </button>
        <nav className="main-nav" aria-label="Navigation">
          <button className={page !== 'api' ? 'active' : ''} onClick={() => go('catalog')}><Film size={16} /> Catalogue</button>
          {user && <button className={page === 'api' ? 'active' : ''} onClick={() => go('api')}><Code2 size={16} /> Espace API</button>}
        </nav>
        <div className="account-actions">
          {user ? <>
            <span className="account-name"><ShieldCheck size={15} /> {user.name}</span>
            <button className="account-button" onClick={logout}><LogOut size={15} /> Déconnexion</button>
          </> : <>
            <button className="account-button" onClick={() => setAuthMode('login')}><LogIn size={15} /> Connexion</button>
            <button className="account-button primary" onClick={() => setAuthMode('signup')}><UserPlus size={15} /> Inscription</button>
          </>}
        </div>
      </header>

      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Fermer"><X size={15} /></button></div>}

      <main>
        {page === 'api' ? user
          ? <DeveloperPortal user={user} onNotice={setNotice} />
          : <section className="locked-state"><div className="lock-icon"><KeyRound size={24} /></div><span className="eyebrow">ESPACE API PROTÉGÉ</span><h1>Connectez-vous pour continuer</h1><p>La documentation, les clés et les outils API sont réservés aux comptes inscrits.</p><div className="button-row"><button className="button primary" onClick={() => setAuthMode('login')}>Connexion</button><button className="button" onClick={() => setAuthMode('signup')}>Créer un compte</button></div></section>
          : page === 'detail' && selected
            ? reader
              ? <ScanReader chapter={reader} work={selected} onBack={() => setReader(null)} />
              : <Detail work={selected} loading={detailLoading} error={detailError} onBack={() => go('catalog')} onRead={openChapter} />
            : <Catalog
              works={filtered}
              loading={loading}
              error={loadError}
              query={query}
              setQuery={setQuery}
              kind={kind}
              setKind={setKind}
              onOpen={openWork}
              onOpenApi={() => user ? go('api') : setAuthMode('signup')}
            />}
      </main>

      <footer className="footer">
        <div><span className="brand-mark small">F</span><strong>FreeDexAn</strong><span>Catalogue et API communautaire</span></div>
        <button onClick={() => user ? go('api') : setAuthMode('login')}><Code2 size={14} /> Espace API</button>
      </footer>

      {authMode && <AuthModal mode={authMode} setMode={setAuthMode} onSubmit={authRequest} onClose={() => setAuthMode('')} />}
    </div>
  );
}

function Catalog({ works, loading, error, query, setQuery, kind, setKind, onOpen, onOpenApi }) {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 48;
  const pageCount = Math.max(1, Math.ceil(works.length / pageSize));
  const visibleWorks = works.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  useEffect(() => setPageNumber(1), [query, kind]);

  return <div className="page catalog-page">
    <section className="catalog-hero">
      <div className="hero-copy">
        <span className="eyebrow"><BookOpen size={14} /> CATALOGUE OUVERT</span>
        <h1>Explorez les<br /><span>univers animés.</span></h1>
        <p>Recherchez animés, webtoons et scans. Retrouvez les fiches, saisons, épisodes et versions disponibles.</p>
        <button className="button primary" onClick={onOpenApi}><Code2 size={16} /> Accéder à l’API <ArrowRight size={15} /></button>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-symbol">F</div><div className="hero-chip chip-one">VF</div><div className="hero-chip chip-two">SCAN</div></div>
    </section>

    <section className="catalog-section">
      <div className="catalog-heading">
        <div><span className="eyebrow">DÉCOUVRIR</span><h2>Le catalogue</h2><p>{loading ? 'Chargement…' : `${works.length.toLocaleString('fr-FR')} résultat${works.length > 1 ? 's' : ''}`}</p></div>
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un animé, un webtoon…" /></label>
      </div>
      <div className="filter-row" role="tablist" aria-label="Filtrer par type">
        {kinds.map((option) => <button key={option.id} className={kind === option.id ? 'selected' : ''} onClick={() => setKind(option.id)}>{option.label}</button>)}
      </div>
      {error && <div className="error-panel">{error}<span>Vérifiez la source du catalogue puis réessayez.</span></div>}
      {loading ? <div className="loading-grid">{Array.from({ length: 8 }, (_, i) => <div className="skeleton" key={i} />)}</div>
        : works.length ? <>
          <div className="work-grid">{visibleWorks.map((work) => <WorkCard key={work.id || work.slug} work={work} onOpen={onOpen} />)}</div>
          {pageCount > 1 && <nav className="catalog-pagination" aria-label="Pages du catalogue">
            <button disabled={pageNumber === 1} onClick={() => { setPageNumber((current) => current - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ChevronLeft size={15} /> Précédent</button>
            <span>Page {pageNumber} / {pageCount}</span>
            <button disabled={pageNumber === pageCount} onClick={() => { setPageNumber((current) => current + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Suivant <ChevronRight size={15} /></button>
          </nav>}
        </>
          : <div className="empty-state"><Search size={25} /><h3>Aucun résultat</h3><p>Modifiez la recherche ou choisissez un autre type.</p></div>}
    </section>
  </div>;
}

function WorkCard({ work, onOpen }) {
  const poster = safeUrl(work.poster || work.cover || work.image);
  const count = work.seasons?.length || work.chapters?.length || 0;
  return <button className="work-card" onClick={() => onOpen(work)}>
    <div className="poster-wrap">{poster ? <img src={poster} alt="" loading="lazy" /> : <div className="poster-placeholder"><BookOpen size={28} /></div>}
      <span className="type-badge">{kindLabel(work.kind)}</span>
    </div>
    <div className="work-card-copy"><h3>{work.name || work.title}</h3><div><span>{work.year || work.status || 'Fiche disponible'}</span>{count > 0 && <span>{count} {work.chapters?.length ? 'chapitres' : 'saisons'}</span>}</div></div>
  </button>;
}

function Detail({ work, loading, error, onBack, onRead }) {
  const poster = safeUrl(work.poster || work.cover || work.image);
  const seasons = work.seasons || [];
  const scanOrWebtoon = ['scan', 'webtoon'].includes(work.kind);
  const chapterEntries = [
    ...(work.chapters || []),
    ...(scanOrWebtoon ? seasons.filter((season) => season.sourceUrl).map((season) => ({
      name: season.name,
      url: season.sourceUrl
    })) : [])
  ];
  const chapters = [...new Map(chapterEntries.map((chapter, index) => {
    const entry = typeof chapter === 'string' ? { url: chapter } : chapter;
    return [entry.url || entry.sourceUrl || `${entry.name || 'chapter'}-${index}`, entry];
  })).values()];
  const genres = Array.isArray(work.genres) ? work.genres : [];
  return <div className="page detail-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Retour au catalogue</button>
    <section className="detail-hero">
      {poster && <img className="detail-backdrop" src={poster} alt="" />}
      <div className="detail-overlay" />
      <div className="detail-main">
        <div className="detail-cover">{poster ? <img src={poster} alt={`Affiche de ${work.name}`} /> : <BookOpen size={40} />}</div>
        <div className="detail-copy">
          <span className="type-badge large">{kindLabel(work.kind)}</span>
          <h1>{work.name || work.title}</h1>
          <div className="tag-row">{genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <p>{work.description || work.synopsis || 'Aucune description disponible pour cette fiche.'}</p>
          <div className="detail-meta">
            {work.year && <span><strong>Année</strong>{work.year}</span>}
            {work.status && <span><strong>État</strong>{work.status}</span>}
            {work.studio && <span><strong>Studio</strong>{work.studio}</span>}
            {seasons.length > 0 && <span><strong>Saisons</strong>{seasons.length}</span>}
            {chapters.length > 0 && <span><strong>Chapitres</strong>{chapters.length}</span>}
          </div>
          {safeUrl(work.sourceUrl) && <a className="source-link" href={safeUrl(work.sourceUrl)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Page de la source</a>}
        </div>
      </div>
      {loading && <div className="detail-loading"><span className="spinner" /> Actualisation des saisons et épisodes…</div>}
    </section>
    {error && <div className="error-panel inline">{error}</div>}

    {seasons.length > 0 && !scanOrWebtoon && <section className="detail-section">
      <div className="section-heading"><div><span className="eyebrow">DÉTAILS</span><h2>Saisons et épisodes</h2></div><span className="section-count">{seasons.length} saisons</span></div>
      <div className="season-list">{seasons.map((season, index) => <SeasonCard key={season.id || `${season.name}-${index}`} season={season} />)}</div>
    </section>}

    {chapters.length > 0 && <section className="detail-section">
      <div className="section-heading"><div><span className="eyebrow">LECTURE</span><h2>{work.kind === 'webtoon' ? 'Épisodes et chapitres' : 'Chapitres'}</h2></div><span className="section-count">{chapters.length} chapitres</span></div>
      <div className="chapter-list">{chapters.map((chapter, index) => {
        const entry = typeof chapter === 'string' ? { url: chapter } : chapter;
        const label = entry.name || entry.title || `Chapitre ${entry.number || index + 1}`;
        const pages = entry.pages || entry.pageUrls || entry.images || [];
        const href = safeUrl(entry.url || entry.sourceUrl);
        return <div className="chapter-row" key={`${label}-${index}`}>
          <div><BookOpen size={16} /><span>{label}</span><small>{pages.length ? `${pages.length} pages · lecture intégrée` : href && ['anime-sama.to', 'www.anime-sama.to'].includes(new URL(href).hostname) ? 'Lecture intégrée disponible' : 'Source externe'}</small></div>
          {pages.length || (href && ['anime-sama.to', 'www.anime-sama.to'].includes(new URL(href).hostname)) ? <button className="button small primary" onClick={() => onRead({ ...entry, name: label, pages })}>Lire sur le site <ArrowRight size={14} /></button>
            : href ? <a className="source-link" href={href} target="_blank" rel="noreferrer">Ouvrir la source <ExternalLink size={14} /></a> : <span className="muted">Pages non disponibles</span>}
        </div>;
      })}</div>
    </section>}

    {!seasons.length && !chapters.length && !loading && <div className="empty-detail"><Tv size={23} /><h2>Pas encore de détails</h2><p>Cette fiche ne contient pas encore de saisons, épisodes ou chapitres.</p></div>}
  </div>;
}

function SeasonCard({ season }) {
  const versions = season.versions || [];
  return <article className="season-card">
    <div className="season-heading"><div><span className="season-number">SAISON</span><h3>{season.name || 'Saison'}</h3></div>{safeUrl(season.sourceUrl) && <a href={safeUrl(season.sourceUrl)} target="_blank" rel="noreferrer">Source <ExternalLink size={13} /></a>}</div>
    {versions.length ? <div className="version-list">{versions.map((version, index) => {
      const episodes = episodesFor(version);
      return <div className="version-block" key={`${version.name}-${index}`}>
        <div className="version-heading"><strong>{version.name || 'Version'}</strong><span>{episodes.length} épisodes</span></div>
        {episodes.length ? <div className="episode-list">{episodes.map((episode, episodeIndex) => {
          const href = safeUrl(typeof episode === 'string' ? episode : episode?.url);
          const label = episodeName(version, episodeIndex);
          return <div className="episode-row" key={`${label}-${episodeIndex}`}><span className="episode-index">{String(episodeIndex + 1).padStart(2, '0')}</span><span>{label}</span>{href && <a href={href} target="_blank" rel="noreferrer" aria-label={`Ouvrir ${label} à la source`}><ExternalLink size={13} /></a>}</div>;
        })}</div> : <p className="muted">Aucun épisode renseigné pour cette version.</p>}
      </div>;
    })}</div> : <p className="muted">Pas de liste d’épisodes disponible pour cette saison.</p>}
  </article>;
}

function ScanReader({ chapter, work, onBack }) {
  const pages = (chapter.pages || []).map((page) => typeof page === 'string' ? page : page.url || page.src).map(safeUrl).filter(Boolean);
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [chapter]);
  return <section className="page reader-page">
    <div className="reader-toolbar"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> {work.name}</button><strong>{chapter.name || chapter.title || 'Lecture du scan'}</strong><span>{pages.length ? `${index + 1} / ${pages.length}` : ''}</span></div>
    {pages.length ? <><div className="reader-canvas"><img src={pages[index]} alt={`Page ${index + 1}`} /><div className="reader-controls"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ChevronLeft size={18} /> Précédente</button><span>Page {index + 1} sur {pages.length}</span><button disabled={index >= pages.length - 1} onClick={() => setIndex((value) => value + 1)}>Suivante <ChevronRight size={18} /></button></div></div><div className="reader-page-list">{pages.map((_, pageIndex) => <button className={index === pageIndex ? 'selected' : ''} key={pageIndex} onClick={() => setIndex(pageIndex)}>{pageIndex + 1}</button>)}</div></>
      : <div className="empty-state"><BookOpen size={25} /><h3>Pages indisponibles</h3><p>Cette fiche ne fournit pas de pages d’images lisibles dans le site.</p></div>}
  </section>;
}

function AuthModal({ mode, setMode, onSubmit, onClose }) {
  const signup = mode === 'signup';
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="auth-modal" onSubmit={(event) => onSubmit(event, signup ? 'signup' : 'login')}>
      <button className="close-button" type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      <span className="eyebrow"><KeyRound size={14} /> COMPTE FREEDExAN</span>
      <h2>{signup ? 'Créer votre compte' : 'Bon retour'}</h2>
      <p>{signup ? 'Inscrivez-vous pour consulter la documentation et gérer vos clés API.' : 'Connectez-vous pour accéder à votre espace API.'}</p>
      {signup && <label className="field"><span>Nom affiché</span><input name="name" required maxLength="60" autoComplete="name" placeholder="Votre nom" /></label>}
      <label className="field"><span>Adresse e-mail</span><input name="email" required type="email" maxLength="254" autoComplete="email" placeholder="vous@exemple.fr" /></label>
      <label className="field"><span>Mot de passe</span><input name="password" required type="password" minLength="10" autoComplete={signup ? 'new-password' : 'current-password'} placeholder="10 caractères minimum" /></label>
      <button className="button primary full" type="submit">{signup ? 'Créer mon compte' : 'Se connecter'} <ArrowRight size={15} /></button>
      <button className="auth-switch" type="button" onClick={() => setMode(signup ? 'login' : 'signup')}>{signup ? 'Déjà inscrit ? Se connecter' : 'Pas de compte ? Inscription'}</button>
    </form>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
