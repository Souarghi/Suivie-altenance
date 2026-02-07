import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, ExternalLink, FileText, 
  Upload, FileCheck, List, LogOut, User, LayoutGrid,
  CheckCircle, RefreshCw, AlertOctagon, Heart, ShieldCheck, Download, Link as LinkIcon, Smartphone, Share, Check
} from 'lucide-react';

// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

// Sécurité
const safeSupabase = () => {
  if (!supabaseUrl || supabaseUrl.includes('TON_URL')) return null;
  return createClient(supabaseUrl, supabaseKey);
};
const supabase = safeSupabase();

// --- DONNÉES ---
const JOB_BOARDS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/', color: 'text-[#0077b5] border-[#0077b5] hover:bg-[#0077b5] hover:text-white' },
  { name: 'HelloWork', url: 'https://www.hellowork.com/', color: 'text-[#ff0000] border-[#ff0000] hover:bg-[#ff0000] hover:text-white' },
  { name: 'WTTJ', url: 'https://www.welcometothejungle.com/', color: 'text-[#ffcd00] border-[#ffcd00] hover:bg-[#ffcd00] hover:text-black' },
  { name: 'Indeed', url: 'https://fr.indeed.com/', color: 'text-[#2164f3] border-[#2164f3] hover:bg-[#2164f3] hover:text-white' },
  { name: 'AFI24', url: 'https://www.afi24.org/', color: 'text-purple-700 border-purple-700 hover:bg-purple-700 hover:text-white' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'text-[#0f1f41] border-[#0f1f41] hover:bg-[#0f1f41] hover:text-white' },
  { name: 'JobTeaser', url: 'https://cytech.jobteaser.com/', color: 'text-[#00ab65] border-[#00ab65] hover:bg-[#00ab65] hover:text-white' },
  { name: 'MyJobGlasses', url: 'https://www.myjobglasses.com/', color: 'text-pink-600 border-pink-600 hover:bg-pink-600 hover:text-white' },
];

// --- MODALS ---
const InstallModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <img src="/logo.png" className="w-12 h-12 object-contain" alt="Logo"/>
      </div>
      <h2 className="text-xl font-bold text-[#0f1f41] mb-2">Installer l'App</h2>
      <div className="text-left space-y-4 bg-gray-50 p-4 rounded-xl mb-6">
        <div><h3 className="font-bold text-gray-800 text-sm">🍎 iPhone (Safari)</h3><p className="text-xs text-gray-500">Bouton <strong>Partager</strong> <Share size={10} className="inline"/> &gt; <strong>Sur l'écran d'accueil</strong></p></div>
        <div className="border-t pt-3"><h3 className="font-bold text-gray-800 text-sm">🤖 Android (Chrome)</h3><p className="text-xs text-gray-500">Menu <strong>3 points</strong> &gt; <strong>Installer l'application</strong></p></div>
      </div>
      <button onClick={onClose} className="w-full bg-[#0f1f41] text-white font-bold py-3 rounded-xl">J'ai compris</button>
    </div>
  </div>
);

const LegalModal = ({ onClose, onExport, onDeleteAccount, isAuthScreen }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-xl font-bold text-[#0f1f41]">RGPD & Infos</h2><button onClick={onClose}><X size={24}/></button></div>
      <div className="space-y-4 text-sm text-gray-700">
        <p>Application développée par <strong>Sheryne OUARGHI-MHIRI</strong>.</p>
        <p>Vos données sont privées et sécurisées. Conformément au RGPD, vous disposez d'un droit d'accès, de modification et de suppression.</p>
        {!isAuthScreen && (
            <div className="flex flex-col gap-3 mt-4">
                <button onClick={onExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 w-fit"><Download size={16}/> Exporter mes données (CSV)</button>
                <button onClick={() => { if(window.confirm("ES-TU SÛR ?")) onDeleteAccount(); }} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 w-fit"><Trash2 size={16}/> Supprimer mon compte</button>
            </div>
        )}
      </div>
    </div>
  </div>
);

// --- COMPOSANTS UI ---
const DailyRoutine = () => {
    const [checks, setChecks] = useState({});
    const today = new Date().toLocaleDateString('fr-FR');
    useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('dailyRoutine') || '{}'); if (saved.date !== today) { setChecks({}); localStorage.setItem('dailyRoutine', JSON.stringify({ date: today, checks: {} })); } else { setChecks(saved.checks || {}); } } catch(e) {} }, [today]);
    const toggleCheck = (siteName) => { const newChecks = { ...checks, [siteName]: !checks[siteName] }; setChecks(newChecks); localStorage.setItem('dailyRoutine', JSON.stringify({ date: today, checks: newChecks })); };
    const progress = Math.round((Object.values(checks).filter(Boolean).length / JOB_BOARDS.length) * 100);
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-3"><h3 className="font-bold flex items-center gap-2 text-gray-800"><RefreshCw size={18} className={progress===100?"text-green-500":"text-blue-600"}/> Routine Matin ({today})</h3><div className="text-xs font-bold text-gray-500">{progress}%</div></div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className={`h-2 rounded-full transition-all duration-500 ${progress===100?'bg-green-500':'bg-blue-500'}`} style={{width: `${progress}%`}}></div></div>
        <div className="flex flex-wrap gap-2">{JOB_BOARDS.map(site => (<button key={site.name} onClick={() => toggleCheck(site.name)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${checks[site.name] ? 'bg-gray-100 border-gray-300 text-gray-400 grayscale' : `bg-white ${site.color}`}`}>{checks[site.name] ? <CheckCircle size={14}/> : <div className="w-3.5 h-3.5 rounded-full border border-current"></div>}{site.name}<a href={site.url} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="ml-1 opacity-70 hover:opacity-100"><ExternalLink size={10}/></a></button>))}</div>
      </div>
    );
};

const AuthScreen = ({ supabase }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLegal, setShowLegal] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Erreur clés API");
    setLoading(true); setMessage('');
    try {
      const { error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (isSignUp) { setMessage('Compte créé !'); setIsSignUp(false); }
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      <div className="md:w-1/2 bg-[#0f1f41] text-white p-8 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-3 mb-8"><img src="/logo.png" onError={(e)=>{e.target.style.display='none'}} className="w-12 h-12 bg-white rounded-xl p-2 object-contain" alt="Logo"/><span className="text-2xl font-bold">Suivi Alternance</span></div>
            <h1 className="text-4xl font-extrabold mb-6">Ne perdez plus le fil de vos candidatures.</h1>
            <p className="text-gray-300 mb-8">L'outil ultime pour les étudiants. Centralisez, relancez, décrochez votre alternance.</p>
        </div>
        <div className="flex flex-col gap-3">
            <button onClick={()=>setShowInstall(true)} className="flex items-center gap-2 text-yellow-400 font-bold"><Smartphone size={18}/> Installer l'App</button>
            <button onClick={()=>setShowLegal(true)} className="text-sm text-gray-400 underline text-left">Mentions Légales</button>
        </div>
      </div>
      <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isSignUp ? "Créer un compte" : "Connexion"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button disabled={loading} className="w-full bg-[#005792] text-white font-bold py-3 rounded-lg">{loading ? '...' : (isSignUp ? "S'inscrire" : "Se connecter")}</button>
            </form>
            {message && <div className="mt-4 p-2 bg-blue-50 text-blue-700 text-sm text-center rounded">{message}</div>}
            <button onClick={()=>setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-[#005792] font-bold hover:underline">{isSignUp ? "J'ai déjà un compte" : "Créer un compte"}</button>
        </div>
      </div>
      {showLegal && <LegalModal onClose={()=>setShowLegal(false)} isAuthScreen={true} />}
      {showInstall && <InstallModal onClose={()=>setShowInstall(false)} />}
    </div>
  );
};

// --- APPLICATION ---
const App = () => {
  const [session, setSession] = useState(null);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLegal, setShowLegal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date_desc");
  const [viewMode, setViewMode] = useState("list"); 
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef(null);
  
  const [newApp, setNewApp] = useState({ 
    company: "", role: "", status: "A faire", location: "", source: "LinkedIn", 
    contact_email: "", application_url: "", date: new Date().toISOString().split('T')[0], relanceDone: false, isFavorite: false 
  });

  const statusOptions = ["A faire", "Postulé", "Entretien", "Accepté", "Refusé"];
  const sourceOptions = ["LinkedIn", "Indeed", "HelloWork", "WTTJ", "JobTeaser", "Contact direct", "Site Entreprise", "Autre"];

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if(session) fetchData(); else setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if(session) fetchData(); else setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: apps } = await supabase.from('applications').select('*');
      setApplications(apps || []);
      const { data: prof } = await supabase.from('profile').select('*').limit(1).maybeSingle();
      if (prof) setProfile(prof);
      else { const { data: newProf } = await supabase.from('profile').insert([{}]).select().single(); if(newProf) setProfile(newProf); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) { alert("Fichier trop lourd (Max 2 Mo)"); return null; }
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) { alert("Erreur upload"); return null; }
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const updateData = type === 'ats' ? { cv_ats: url } : { cv_human: url };
      if (!profile.id) await supabase.from('profile').insert([updateData]);
      else await supabase.from('profile').update(updateData).gt('id', 0);
      setProfile(prev => ({ ...prev, ...updateData }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = newApp.company && applications.some(a => a.company.toLowerCase().trim() === newApp.company.toLowerCase().trim() && a.id !== editingId);
    if (isDuplicate && !editingId) return alert("Doublon détecté !");
    
    setUploading(true);
    const appData = { ...newApp };
    if (editingId) {
      await supabase.from('applications').update(appData).eq('id', editingId);
      setApplications(prev => prev.map(a => a.id === editingId ? { ...a, ...appData } : a));
    } else {
      const { data } = await supabase.from('applications').insert([appData]).select();
      if (data) setApplications([data[0], ...applications]);
    }
    resetForm();
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ?")) {
      await supabase.from('applications').delete().eq('id', id);
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleRelance = async (app) => {
    const newVal = !app.relanceDone;
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, relanceDone: newVal } : a));
    await supabase.from('applications').update({ relanceDone: newVal }).eq('id', app.id);
  };

  const toggleFavorite = async (app) => {
    const newVal = !app.isFavorite;
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, isFavorite: newVal } : a));
    await supabase.from('applications').update({ isFavorite: newVal }).eq('id', app.id);
  };

  const handleEdit = (app) => {
      setNewApp(app);
      setEditingId(app.id);
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => { setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", application_url: "", date: new Date().toISOString().split('T')[0], relanceDone: false, isFavorite: false }); setEditingId(null); };
  const calculateRelance = (d) => { if (!d) return "-"; const date = new Date(d); date.setDate(date.getDate() + 15); return date.toLocaleDateString('fr-FR'); };
  
  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Source", "Lien/Email", "Date"];
    const rows = applications.map(app => [`"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.source}"`, `"${app.application_url||app.contact_email}"`, `"${app.date}"`]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "candidatures.csv"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const deleteAccountData = async () => {
    setLoading(true);
    await supabase.from('applications').delete().neq('id', 0);
    await supabase.from('profile').delete().neq('id', 0);
    await supabase.auth.signOut();
    setSession(null); setLoading(false); setShowLegal(false); alert("Compte supprimé.");
  };

  const uniqueCompanies = [...new Set(applications.map(a => a.company))];
  const uniqueLocations = [...new Set(applications.map(a => a.location))];

  const filteredApps = applications
    .filter(a => a.company?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
        if (sortType === 'favorite') return (b.isFavorite === true) - (a.isFavorite === true);
        if (sortType === 'alpha') return a.company.localeCompare(b.company);
        if (sortType === 'date_asc') return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

  if (!supabase) return <div className="p-10 text-red-600 text-center">Clés API manquantes</div>;
  if (!session) return <AuthScreen supabase={supabase} />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-3 md:p-6 space-y-6 flex-1">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
                <img src="/logo.png" onError={(e) => e.target.style.display='none'} className="w-full h-full object-contain z-10" alt="Logo"/>
                <Briefcase size={20} className="text-blue-500 absolute opacity-30" />
             </div>
             <h1 className="font-bold text-lg md:text-xl text-[#0f1f41]">Suivi Alternance</h1>
          </div>
          <button onClick={() => {supabase.auth.signOut(); setSession(null);}} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><LogOut size={20}/></button>
        </div>

        <DailyRoutine />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            {/* DOCS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <h2 className="font-bold flex items-center gap-2 mb-4 text-[#0f1f41]"><FileCheck className="text-[#005792]"/> Mes Documents</h2>
               <div className="space-y-3">
                  <div className="relative group">
                    <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${profile?.cv_ats ? 'border-[#00ab65] bg-green-50' : 'border-dashed border-gray-300 hover:bg-blue-50'}`}>
                      <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${profile?.cv_ats ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}><FileText size={18}/></div><div><span className="text-sm font-bold text-gray-700 block">CV ATS</span><span className="text-[10px] text-gray-500">{profile?.cv_ats ? "Cliquer pour remplacer" : "Ajouter un PDF"}</span></div></div>
                      {uploading ? <span className="text-xs">...</span> : (profile?.cv_ats ? <RefreshCw size={16} className="text-green-600"/> : <Upload size={16} className="text-gray-400"/>)}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/>
                    </label>
                    {profile?.cv_ats && <a href={profile.cv_ats} target="_blank" rel="noreferrer" className="absolute right-12 top-4 text-xs font-bold text-[#00ab65] hover:underline z-10 bg-green-50 px-1 rounded">Voir</a>}
                  </div>
                  <div className="relative group">
                    <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer ${profile?.cv_human ? 'border-[#005792] bg-blue-50' : 'border-dashed border-gray-300 hover:bg-yellow-50'}`}>
                      <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${profile?.cv_human ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}><User size={18}/></div><div><span className="text-sm font-bold text-gray-700 block">CV Design</span><span className="text-[10px] text-gray-500">{profile?.cv_human ? "Cliquer pour remplacer" : "Ajouter un PDF"}</span></div></div>
                      {uploading ? <span className="text-xs">...</span> : (profile?.cv_human ? <RefreshCw size={16} className="text-[#005792]"/> : <Upload size={16} className="text-gray-400"/>)}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'human')} disabled={uploading}/>
                    </label>
                    {profile?.cv_human && <a href={profile.cv_human} target="_blank" rel="noreferrer" className="absolute right-12 top-4 text-xs font-bold text-[#005792] hover:underline z-10 bg-blue-50 px-1 rounded">Voir</a>}
                  </div>
               </div>
            </div>

            {/* FORMULAIRE */}
            <div ref={formRef} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 ${editingId ? 'ring-2 ring-orange-200' : ''}`}>
               <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-[#0f1f41]">{editingId ? "Modifier" : "Nouvelle Candidature"}</h2>{editingId && <button onClick={resetForm}><X size={16}/></button>}</div>
               <form onSubmit={handleSubmit} className="space-y-3">
                  <datalist id="companies">{uniqueCompanies.map(c => <option key={c} value={c}/>)}</datalist>
                  <datalist id="locations">{uniqueLocations.map(l => <option key={l} value={l}/>)}</datalist>
                  <input list="companies" placeholder="Entreprise (ex: Thales)" className="w-full border p-2 rounded-lg text-sm bg-gray-50" value={newApp.company} onChange={e=>setNewApp({...newApp, company: e.target.value})} required/>
                  <input placeholder="Poste (ex: Data Analyst)" className="w-full border p-2 rounded-lg text-sm bg-gray-50" value={newApp.role} onChange={e=>setNewApp({...newApp, role: e.target.value})} required/>
                  <div className="grid grid-cols-2 gap-3">
                    <select className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.source} onChange={e=>setNewApp({...newApp, source: e.target.value})}>{sourceOptions.map(s=><option key={s} value={s}>{s}</option>)}</select>
                    <select className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.status} onChange={e=>setNewApp({...newApp, status: e.target.value})}>{statusOptions.map(s=><option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  {newApp.source === 'Contact direct' ? (
                     <div className="bg-blue-50 p-3 rounded-lg space-y-2 border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 uppercase">Contact Direct</p>
                        <input list="locations" placeholder="Ville" className="w-full border p-2 rounded text-sm bg-white" value={newApp.location} onChange={e=>setNewApp({...newApp, location: e.target.value})} />
                        <input placeholder="Email du contact" className="w-full border p-2 rounded text-sm" value={newApp.contact_email} onChange={e=>setNewApp({...newApp, contact_email: e.target.value})} />
                        <input type="date" className="w-full border p-2 rounded text-sm" value={newApp.date} onChange={e=>setNewApp({...newApp, date: e.target.value})} required />
                     </div>
                  ) : (
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                           <input type="date" className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.date} onChange={e=>setNewApp({...newApp, date: e.target.value})} required />
                           <input list="locations" placeholder="Ville" className="border p-2 rounded-lg text-sm bg-gray-50" value={newApp.location} onChange={e=>setNewApp({...newApp, location: e.target.value})} />
                        </div>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input placeholder="Lien de l'annonce (URL)" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-gray-50" value={newApp.application_url} onChange={e=>setNewApp({...newApp, application_url: e.target.value})} />
                        </div>
                     </div>
                  )}
                  <button disabled={uploading} className={`w-full py-2.5 rounded-lg text-white font-bold text-sm ${editingId?'bg-orange-500':'bg-[#005792] hover:bg-[#004270]'}`}>{uploading ? "..." : (editingId ? "Sauvegarder" : "Ajouter")}</button>
               </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
             {/* CONTROLES */}
             <div className="flex flex-col md:flex-row gap-3">
                <div className="flex bg-white rounded-lg border p-1 self-start">
                   <button onClick={()=>setViewMode('list')} className={`p-2 rounded ${viewMode==='list'?'bg-gray-100 text-blue-600':'text-gray-400'}`}><List size={18}/></button>
                   <button onClick={()=>setViewMode('kanban')} className={`p-2 rounded ${viewMode==='kanban'?'bg-gray-100 text-blue-600':'text-gray-400'}`}><LayoutGrid size={18}/></button>
                </div>
                <div className="flex-1 relative">
                   <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                   <input placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                </div>
                <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
                    <option value="favorite">❤️ Favoris</option>
                    <option value="date_desc">📅 Date (Récent)</option>
                    <option value="date_asc">📅 Date (Ancien)</option>
                    <option value="alpha">🔤 A-Z</option>
                </select>
             </div>

             {/* VUE LISTE */}
             {viewMode === 'list' && (
               <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden min-h-[500px]">
                 {/* TABLEAU DESKTOP */}
                 <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
                         <tr><th className="p-4 w-10"></th><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Infos</th><th className="p-4 text-center">Relance</th><th className="p-4 text-center">Fait</th><th className="p-4 text-right">Action</th></tr>
                       </thead>
                       <tbody className="divide-y">
                         {filteredApps.map(app => (
                           <tr key={app.id} className="hover:bg-gray-50 group">
                              <td className="p-4"><button onClick={()=>toggleFavorite(app)}><Heart size={18} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-300"}/></button></td>
                              <td className="p-4 font-bold text-[#0f1f41]">{app.company}</td>
                              <td className="p-4 text-gray-600">{app.role}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${app.status==='Postulé'?'bg-blue-50 border-blue-200 text-blue-700':app.status==='Refusé'?'bg-red-50 border-red-200 text-red-700':app.status==='Accepté'?'bg-green-50 border-green-200 text-green-700':'bg-gray-50 border-gray-200'}`}>{app.status}</span></td>
                              <td className="p-4 text-xs">{app.location && <div className="font-bold">{app.location}</div>}{app.contact_email && <div className="text-blue-500">{app.contact_email}</div>}{app.application_url && <a href={app.application_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Lien annonce</a>}</td>
                              <td className="p-4 text-center"><span className={`text-xs font-bold px-2 py-1 rounded ${app.relanceDone ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>{calculateRelance(app.date)}</span></td>
                              <td className="p-4 text-center"><input type="checkbox" checked={app.relanceDone || false} onChange={() => toggleRelance(app)} className="w-5 h-5 cursor-pointer"/></td>
                              <td className="p-4 text-right"><button onClick={()=>handleDelete(app.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button><button onClick={()=>handleEdit(app)} className="text-gray-300 hover:text-blue-500 p-1"><Pencil size={16}/></button></td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>

                 {/* CARTES MOBILE */}
                 <div className="md:hidden space-y-3">
                    {filteredApps.map(app => (
                       <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                             <div><h3 className="font-bold text-[#0f1f41] text-lg">{app.company}</h3><p className="text-gray-600 text-sm">{app.role}</p></div>
                             <button onClick={()=>toggleFavorite(app)}><Heart size={20} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"}/></button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                             <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${app.status==='Postulé'?'bg-blue-50 border-blue-200 text-blue-700':app.status==='Refusé'?'bg-red-50 border-red-200 text-red-700':app.status==='Accepté'?'bg-green-50 border-green-200 text-green-700':'bg-gray-50 border-gray-200'}`}>{app.status}</span>
                             <span className="text-xs text-gray-500 border px-2 py-0.5 rounded-full">{app.source}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
                             {app.location && <span className="flex items-center gap-1"><MapPin size={12}/> {app.location}</span>}
                             {app.contact_email && <a href={`mailto:${app.contact_email}`} className="text-blue-600 flex items-center gap-1"><Mail size={12}/> {app.contact_email}</a>}
                             {app.application_url && <a href={app.application_url} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1"><ExternalLink size={12}/> Voir l'annonce</a>}
                          </div>
                          <div className="flex justify-between items-center border-t pt-3 mt-2">
                             <div className="flex items-center gap-2">
                                 <input type="checkbox" checked={app.relanceDone || false} onChange={() => toggleRelance(app)} className="w-5 h-5 rounded"/>
                                 <span className={`text-xs font-bold ${app.relanceDone ? 'text-green-600' : 'text-orange-600'}`}>J+15: {calculateRelance(app.date)}</span>
                             </div>
                             <div className="flex gap-3">
                                 <button onClick={()=>handleEdit(app)} className="text-blue-500 bg-blue-50 p-2 rounded-lg"><Pencil size={18}/></button>
                                 <button onClick={()=>handleDelete(app.id)} className="text-red-400 bg-red-50 p-2 rounded-lg"><Trash2 size={18}/></button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 {filteredApps.length === 0 && <div className="p-10 text-center text-gray-400">Aucune candidature</div>}
               </div>
             )}

             {/* VUE KANBAN */}
             {viewMode === 'kanban' && (
               <div className="flex gap-4 p-4 overflow-x-auto h-full items-start">
                  {statusOptions.map(status => (
                    <div key={status} className="min-w-[260px] bg-gray-50 rounded-xl p-3 border border-gray-200">
                       <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 flex justify-between">{status} <span className="bg-white border px-1.5 rounded text-gray-400">{filteredApps.filter(a=>a.status===status).length}</span></h3>
                       <div className="flex flex-col gap-2">
                         {filteredApps.filter(a=>a.status===status).map(app => (
                           <div key={app.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:shadow-md" onClick={()=>handleEdit(app)}>
                              <div className="flex justify-between items-start"><div className="font-bold text-[#0f1f41]">{app.company}</div><Heart size={14} className={app.isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"}/></div>
                              <div className="text-xs text-gray-500 mb-2">{app.role}</div>
                              <div className="flex justify-between items-end"><div className="text-[10px] text-gray-400 bg-gray-50 inline-block px-1.5 py-0.5 rounded">Relance: {calculateRelance(app.date)}</div>{app.relanceDone && <CheckCircle size={14} className="text-green-500"/>}</div>
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
      <footer className="bg-white border-t p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-2"><p>© 2026 - Développé avec <Heart size={10} className="inline text-red-400"/> par Sheryne OUARGHI-MHIRI</p><button onClick={() => setShowLegal(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">Mentions Légales & RGPD</button></footer>
      {showLegal && <LegalModal onClose={() => setShowLegal(false)} onExport={exportToCSV} onDeleteAccount={deleteAccountData} />}
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}
    </div>
  );
};

export default App;