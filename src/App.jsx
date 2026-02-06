import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, FileSpreadsheet, Search, Pencil, X, Mail, ArrowUpDown, AlertTriangle } from 'lucide-react';


// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';


const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Nouveaux états pour le Tri et la Recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("date"); // 'date' ou 'company'
  const [editingId, setEditingId] = useState(null);

  // --- CHARGEMENT ---
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      let { data, error } = await supabase
        .from('applications')
        .select('*');
        // On trie côté client maintenant pour gérer le tri dynamique
      
      if (error) throw error;
      setApplications(data);
    } catch (error) {
      console.error('Erreur chargement:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORMULAIRE ---
  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    status: "A faire",
    location: "",
    source: "LinkedIn",
    contact_email: "", 
    date: new Date().toISOString().split('T')[0],
    relanceDone: false 
  });

  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  ];

  const sourceOptions = ["LinkedIn", "JobTeaser", "Contact direct", "Site de l'entreprise", "Indeed", "Welcome to the Jungle", "Autre"];

  // --- FONCTIONS UTILITAIRES ---

  // 1. Calcul Relance (Passage à 15 jours)
  const calculateRelanceDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 15); // CHANGEMENT ICI : +15 jours
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusStyle = (val) => statusOptions.find(o => o.value === val)?.color || "bg-gray-100";

  // 2. Normalisation pour la comparaison (ignore accents et majuscules)
  // Ex: "Thalès" devient "thales"
  const normalizeString = (str) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  };

  // 3. Détection de doublons en temps réel
  const checkDuplicates = () => {
    if (!newApp.company) return [];
    const normalizedInput = normalizeString(newApp.company);
    
    // On cherche si l'entreprise existe déjà (en excluant la ligne qu'on est en train de modifier)
    return applications.filter(app => 
      normalizeString(app.company) === normalizedInput && app.id !== editingId
    );
  };

  const duplicates = checkDuplicates(); // Liste des candidatures existantes pour cette entreprise

  // --- ACTIONS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;

    if (editingId) {
      // MODE MODIF
      const { error } = await supabase.from('applications').update(newApp).eq('id', editingId);
      if (error) alert("Erreur : " + error.message);
      else {
        setApplications(applications.map(app => app.id === editingId ? { ...newApp, id: editingId } : app));
        resetForm();
      }
    } else {
      // MODE AJOUT
      const { data, error } = await supabase.from('applications').insert([newApp]).select();
      if (error) alert(`Erreur ajout : ${error.message}`);
      else if (data) {
        setApplications([data[0], ...applications]);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setNewApp({
      company: "", role: "", status: "A faire", location: "", source: "LinkedIn",
      contact_email: "", date: new Date().toISOString().split('T')[0], relanceDone: false
    });
    setEditingId(null);
  };

  const handleEditClick = (app) => {
    setNewApp(app);
    setEditingId(app.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer définitivement ?")) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (!error) setApplications(applications.filter(app => app.id !== id));
    }
  };

  const handleQuickChange = async (id, field, value) => {
    setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app));
    await supabase.from('applications').update({ [field]: value }).eq('id', id);
  };

  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Lieu", "Source", "Info Contact", "Date Envoi", "Relance J+15", "Relance Faite"];
    const rows = applications.map(app => [
      `"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.location}"`, `"${app.source}"`, `"${app.contact_email || ''}"`, `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.relanceDone ? 'OUI' : 'NON'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "suivi_alternance.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // --- FILTRE ET TRI ---
  const filteredAndSortedApplications = applications
    .filter(app => 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === 'company') {
        return a.company.localeCompare(b.company); // Tri alphabétique
      }
      // Par défaut : Tri par date de création (les plus récents en premier)
      // Note: Supabase renvoie created_at, mais si tu ne l'as pas, on utilise la date de candidature
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      return dateB - dateA; 
    });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-blue-600"/> Suivi Alternance</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? "Chargement..." : `${filteredAndSortedApplications.length} candidature(s)`}</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Barre de Recherche */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>

            {/* Bouton de Tri */}
            <button 
              onClick={() => setSortType(sortType === 'date' ? 'company' : 'date')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowUpDown size={16}/> {sortType === 'date' ? 'Trier par Nom (A-Z)' : 'Trier par Date'}
            </button>

            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm whitespace-nowrap"><FileSpreadsheet size={16}/> CSV</button>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {editingId ? <><Pencil size={20} className="text-orange-600" /> Mode Modification</> : <><Plus size={20} className="text-blue-600" /> Nouvelle Candidature</>}
            </h2>
            {editingId && <button onClick={resetForm} className="text-sm text-gray-500 flex items-center gap-1"><X size={16}/> Annuler</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 items-start">
            
            {/* ENTREPRISE + alerte doublon */}
            <div className="md:col-span-3 lg:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                <input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.company} onChange={(e)=>setNewApp({...newApp, company: e.target.value})} required />
              </div>
              {/* ALERTE DOUBLON */}
              {duplicates.length > 0 && (
                <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded-lg border border-orange-200 flex items-start gap-2 animate-pulse">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0"/>
                  <div>
                    <strong>Attention !</strong> Tu as déjà postulé {duplicates.length} fois ici :
                    <ul className="list-disc list-inside mt-1">
                      {duplicates.map(d => (
                        <li key={d.id}>{d.role} ({new Date(d.date).toLocaleDateString()})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3 lg:col-span-3"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label><div className="relative"><Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Dev Fullstack" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.role} onChange={(e)=>setNewApp({...newApp, role: e.target.value})} required /></div></div>
            
            <div className="md:col-span-2 lg:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={newApp.source} onChange={(e)=>setNewApp({...newApp, source: e.target.value})}>{sourceOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}</select>
            </div>

            {/* CONTACT FLEXIBLE (Mail ou Nom) */}
            <div className="md:col-span-2 lg:col-span-2">
              {newApp.source === "Contact direct" ? (
                <div className="animate-fadeIn">
                    <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Contact (Mail/Nom)</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-blue-400" size={16}/>
                    {/* Input type="text" pour accepter les noms, les numéros ou les mails */}
                    <input type="text" placeholder="rh@thales.com ou M. Paul" className="w-full pl-9 pr-3 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.contact_email || ''} onChange={(e)=>setNewApp({...newApp, contact_email: e.target.value})} />
                    </div>
                </div>
              ) : (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu</label>
                    <div className="relative"><MapPin className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Paris" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.location} onChange={(e)=>setNewApp({...newApp, location: e.target.value})} /></div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date envoi</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newApp.date} onChange={(e)=>setNewApp({...newApp, date: e.target.value})} required /></div>
            
            <div className="md:col-span-12 flex justify-end">
              <button type="submit" className={`px-6 py-2 text-white rounded-lg font-medium flex items-center gap-2 text-sm transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <><Pencil size={16}/> Mettre à jour</> : <><Plus size={16}/> Ajouter candidature</>}
              </button>
            </div>
          </form>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider"><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Lieu / Contact</th><th className="p-4">Source</th><th className="p-4">Date</th><th className="p-4">Relance (J+15)</th><th className="p-4 text-center">Fait ?</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? <tr><td colSpan="9" className="p-8 text-center text-gray-500">Chargement...</td></tr> : filteredAndSortedApplications.map((app) => (
                  <tr key={app.id} className={`hover:bg-gray-50 ${editingId === app.id ? 'bg-yellow-50' : ''}`}>
                    <td className="p-4 font-bold">{app.company}</td>
                    <td className="p-4">{app.role}</td>
                    <td className="p-4"><select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>{statusOptions.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></td>
                    <td className="p-4">
                        {app.source === "Contact direct" && app.contact_email ? (
                            <div className="text-blue-600 flex items-center gap-1 font-medium"><Mail size={12}/> {app.contact_email}</div>
                        ) : (
                            <div className="flex items-center gap-1 text-gray-500"><MapPin size={12}/> {app.location||"-"}</div>
                        )}
                    </td>
                    <td className="p-4 text-gray-600">{app.source}</td>
                    <td className="p-4 whitespace-nowrap">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 whitespace-nowrap"><div className="flex gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded border-orange-100 w-fit"><Calendar size={12}/> {calculateRelanceDate(app.date)}</div></td>
                    <td className="p-4 text-center"><button onClick={()=>handleQuickChange(app.id, 'relanceDone', !app.relanceDone)} className={`p-1.5 rounded ${app.relanceDone?'bg-green-100 text-green-600':'bg-gray-100 text-gray-400'}`}><CheckSquare size={20} className={app.relanceDone?"fill-current":""}/></button></td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditClick(app)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={18}/></button>
                      <button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;