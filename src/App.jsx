import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, 
  Search, Pencil, X, Mail, ArrowUpDown, AlertTriangle, 
  ExternalLink, FileText, Upload, FileCheck, FileSpreadsheet,
  LayoutGrid, List // Nouvelles icônes pour le switch
} from 'lucide-react';


// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';


const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. BARRE DE RACCOURCIS ---
const QUICK_LINKS = [
  { name: 'AFI24 (Inscription)', url: 'https://www.afi24.org/', color: 'bg-purple-700' },
  { name: 'JobTeaser CY Tech', url: 'https://cytech.jobteaser.com/', color: 'bg-green-600' },
  { name: 'Data Alumni', url: 'https://cytech.datalumni.com/', color: 'bg-cyan-600' },
  { name: 'APEC', url: 'https://www.apec.fr/', color: 'bg-indigo-700' },
  { name: 'Métierscope', url: 'https://candidat.francetravail.fr/metierscope/', color: 'bg-orange-500' },
  { name: 'Welcome to the Jungle', url: 'https://www.welcometothejungle.com/', color: 'bg-yellow-400 text-black' },
  { name: 'MyJobGlasses', url: 'https://www.myjobglasses.com/', color: 'bg-pink-600' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', color: 'bg-blue-700' },
];

const App = () => {
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({ cv_ats: "", cv_human: "" });
  const [loading, setLoading] = useState(true);
  
  // États de tri, recherche et VUE
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date");
  const [viewMode, setViewMode] = useState("list"); // 'list' ou 'kanban'
  const [editingId, setEditingId] = useState(null);
  
  // États fichiers
  const [fileLM, setFileLM] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let { data: apps } = await supabase.from('applications').select('*');
      setApplications(apps || []);
      let { data: prof } = await supabase.from('profile').select('*').single();
      if (prof) setProfile(prof);
    } catch (error) {
      console.error('Erreur chargement:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [newApp, setNewApp] = useState({
    company: "", role: "", status: "A faire", location: "", source: "LinkedIn",
    contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false,
    lm_url: ""
  });

  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  ];
  
  const sourceOptions = ["LinkedIn", "JobTeaser", "Contact direct", "Site de l'entreprise", "Indeed", "Welcome to the Jungle", "Autre"];

  // Fonctions Backend
  const uploadFileToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('documents').upload(fileName, file);
    if (error) { alert("Erreur upload : " + error.message); return null; }
    const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadFileToSupabase(file);
    if (url) {
      const updateData = type === 'ats' ? { cv_ats: url } : { cv_human: url };
      const { error } = await supabase.from('profile').update(updateData).gt('id', 0);
      if (error || !error) { 
         if (error) console.log("Maj...", error);
         else setProfile(prev => ({ ...prev, ...updateData }));
      }
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;
    setUploading(true);
    let uploadedLMUrl = newApp.lm_url;
    if (fileLM) {
        const url = await uploadFileToSupabase(fileLM);
        if (url) uploadedLMUrl = url;
    }
    const appData = { ...newApp, lm_url: uploadedLMUrl };
    if (editingId) {
      const { error } = await supabase.from('applications').update(appData).eq('id', editingId);
      if (!error) {
        setApplications(applications.map(app => app.id === editingId ? { ...appData, id: editingId } : app));
        resetForm();
      }
    } else {
      const { data, error } = await supabase.from('applications').insert([appData]).select();
      if (!error && data) {
        setApplications([data[0], ...applications]);
        resetForm();
      }
    }
    setUploading(false);
  };

  const handleQuickChange = async (id, field, value) => {
    setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app));
    await supabase.from('applications').update({ [field]: value }).eq('id', id);
  };

  const handleDelete = async (id) => { 
    if (window.confirm("Supprimer ?")) { 
        await supabase.from('applications').delete().eq('id', id); 
        setApplications(applications.filter(app => app.id !== id)); 
    }
  };

  // Utils
  const resetForm = () => { setNewApp({ company: "", role: "", status: "A faire", location: "", source: "LinkedIn", contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false, lm_url: "" }); setFileLM(null); setEditingId(null); };
  const calculateRelanceDate = (d) => { if (!d) return "-"; const date = new Date(d); date.setDate(date.getDate() + 15); return date.toLocaleDateString('fr-FR'); };
  const getStatusStyle = (val) => statusOptions.find(o => o.value === val)?.color || "bg-gray-100";
  const normalizeString = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  const duplicates = newApp.company ? applications.filter(app => normalizeString(app.company) === normalizeString(newApp.company) && app.id !== editingId) : [];
  const handleEditClick = (app) => { setNewApp(app); setEditingId(app.id); setFileLM(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Contact", "Source", "Date", "Relance", "Lien LM"];
    const rows = applications.map(app => [`"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.contact_email || app.location || ''}"`, `"${app.source}"`, `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.lm_url || ''}"`]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "suivi_alternance.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredApps = applications
    .filter(app => app.company.toLowerCase().includes(searchTerm.toLowerCase()) || app.role.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortType === 'company' ? a.company.localeCompare(b.company) : new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[98%] mx-auto space-y-6">
        
        {/* BARRE RACCOURCIS */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 overflow-x-auto flex gap-3 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Ressources :</span>
            {QUICK_LINKS.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`${link.color} text-white px-3 py-1 rounded-md text-xs font-bold hover:opacity-90 whitespace-nowrap flex items-center gap-1 transition-transform hover:scale-105 shadow-sm`}>{link.name} <ExternalLink size={10}/></a>
            ))}
        </div>

        {/* CVs */}
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><FileCheck className="text-blue-300"/> Mes CVs</h2>
                <p className="text-slate-300 text-sm">Tes versions de référence.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64">
                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-300 uppercase">CV ATS</span>{profile.cv_ats && <a href={profile.cv_ats} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Voir</a>}</div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 py-2 rounded text-sm transition-colors border border-dashed border-slate-500"><Upload size={14}/> {profile.cv_ats ? "Remplacer" : "Uploader"} <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'ats')} disabled={uploading}/></label>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 w-full sm:w-64">
                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-blue-300 uppercase">CV Humain</span>{profile.cv_human && <a href={profile.cv_human} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Voir</a>}</div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 py-2 rounded text-sm transition-colors border border-dashed border-slate-500"><Upload size={14}/> {profile.cv_human ? "Remplacer" : "Uploader"} <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleProfileUpload(e.target.files[0], 'human')} disabled={uploading}/></label>
                </div>
            </div>
        </div>

        {/* HEADER + SWITCH VUE */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-blue-600"/> Mes Candidatures</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? "Chargement..." : `${filteredApps.length} suivies`}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center justify-center">
             {/* Switch Liste / Kanban */}
             <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><List size={16}/> Liste</button>
                <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid size={16}/> Kanban</button>
             </div>

             <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none w-40 md:w-auto" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
             <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"><FileSpreadsheet size={16}/> CSV</button>
          </div>
        </div>

        {/* FORMULAIRE (Affiché tout le temps pour ajout rapide) */}
        <div className={`p-6 rounded-xl shadow-sm border ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">{editingId ? <><Pencil size={20} className="text-orange-600" /> Modifier</> : <><Plus size={20} className="text-blue-600" /> Ajouter</>}</h2>
            {editingId && <button onClick={resetForm} className="text-sm text-gray-500 flex items-center gap-1"><X size={16}/> Annuler</button>}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label>
              <div className="relative"><Building2 className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.company} onChange={(e)=>setNewApp({...newApp, company: e.target.value})} required /></div>
              {duplicates.length > 0 && (<div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded-lg flex gap-2 animate-pulse"><AlertTriangle size={14}/> Déjà postulé !</div>)}
            </div>
            <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label><div className="relative"><Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Développeur..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.role} onChange={(e)=>setNewApp({...newApp, role: e.target.value})} required /></div></div>
            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={newApp.source} onChange={(e)=>setNewApp({...newApp, source: e.target.value})}>{sourceOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}</select></div>
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu / Contact</label><div className="relative"><MapPin className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Paris / RH" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.location} onChange={(e)=>setNewApp({...newApp, location: e.target.value})} /></div>
            </div>
            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newApp.date} onChange={(e)=>setNewApp({...newApp, date: e.target.value})} required /></div>
            <div className="md:col-span-8 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300 flex items-center gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center gap-1"><FileText size={12}/> Lettre de Motivation (Optionnel)</label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileLM(e.target.files[0])} className="w-full text-xs text-gray-500"/>
                </div>
                {newApp.lm_url && <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200">✓ Fichier lié</div>}
            </div>
            <div className="md:col-span-4 flex justify-end items-end h-full">
              <button type="submit" disabled={uploading} className={`w-full py-2 text-white rounded-lg font-medium flex justify-center items-center gap-2 text-sm ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? "Envoi..." : (editingId ? "Mettre à jour" : "Ajouter")}
              </button>
            </div>
          </form>
        </div>

        {/* VUE LISTE */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold"><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Contact</th><th className="p-4">LM</th><th className="p-4">Relance</th><th className="p-4 text-center">Fait</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className={`hover:bg-gray-50 ${editingId === app.id ? 'bg-yellow-50' : ''}`}>
                      <td className="p-4 font-bold text-gray-800">{app.company}</td>
                      <td className="p-4 text-gray-600">{app.role}</td>
                      <td className="p-4"><select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${getStatusStyle(app.status)}`}>{statusOptions.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></td>
                      <td className="p-4">{app.contact_email ? <span className="text-blue-600 flex gap-1 items-center font-medium"><Mail size={12}/> {app.contact_email}</span> : <span className="text-gray-500 flex gap-1 items-center"><MapPin size={12}/> {app.location||"-"}</span>}</td>
                      <td className="p-4">{app.lm_url ? <a href={app.lm_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 bg-purple-50 p-1.5 rounded hover:bg-purple-100 inline-block"><FileText size={16}/></a> : <span className="text-gray-300">-</span>}</td>
                      <td className="p-4"><div className="text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit text-xs font-bold border border-orange-100 flex items-center gap-1"><Calendar size={12}/> {calculateRelanceDate(app.date)}</div></td>
                      <td className="p-4 text-center"><button onClick={()=>handleQuickChange(app.id, 'relanceDone', !app.relanceDone)} className={`p-1.5 rounded transition-colors ${app.relanceDone?'bg-green-100 text-green-600':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><CheckSquare size={18} className={app.relanceDone?"fill-current":""}/></button></td>
                      <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEditClick(app)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors"><Pencil size={18}/></button><button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}

        {/* VUE KANBAN */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {statusOptions.map(option => {
              const columnApps = filteredApps.filter(app => app.status === option.value);
              return (
                <div key={option.value} className="min-w-[280px] w-80 bg-gray-100 rounded-xl p-3 flex flex-col gap-3 shrink-0">
                  <div className={`font-bold text-sm uppercase px-2 py-1 flex justify-between items-center ${option.color} bg-white border rounded-lg`}>
                    {option.label}
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{columnApps.length}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-h-[100px]">
                    {columnApps.map(app => (
                      <div key={app.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-800">{app.company}</h3>
                            <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">{app.role}</p>
                        
                        <div className="flex justify-between items-end mt-2">
                           <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> Relance: {calculateRelanceDate(app.date)}</span>
                                <div className="flex gap-1">
                                    {app.lm_url && <a href={app.lm_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 bg-purple-50 p-1 rounded"><FileText size={12}/></a>}
                                    <button onClick={() => handleEditClick(app)} className="text-blue-500 bg-blue-50 p-1 rounded"><Pencil size={12}/></button>
                                </div>
                           </div>
                           
                           {/* Changement rapide de statut via dropdown dans la carte */}
                           <select 
                             value={app.status} 
                             onChange={(e) => handleQuickChange(app.id, 'status', e.target.value)}
                             className="text-[10px] border rounded bg-gray-50 px-1 py-0.5 max-w-[80px]"
                           >
                             {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                           </select>
                        </div>
                      </div>
                    ))}
                    {columnApps.length === 0 && <div className="text-center text-xs text-gray-400 py-4 italic">Vide</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default App;