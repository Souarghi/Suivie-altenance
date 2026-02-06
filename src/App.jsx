import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckSquare, FileSpreadsheet, Search, Pencil, X, Mail } from 'lucide-react';


// 👇 REMETS TES CLÉS SUPABASE ICI
const supabaseUrl = 'https://mvloohmnvggirpdfhotb.supabase.co';
const supabaseKey = 'sb_publishable_fAGf692lpXVGI1YZgyx3Ew_Dz_tEEYO';

const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const [editingId, setEditingId] = useState(null); // Pour savoir si on modifie une ligne

  // --- CHARGEMENT ---
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      let { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
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
    contact_email: "", // Nouveau champ
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

  const calculateRelanceDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusStyle = (val) => statusOptions.find(o => o.value === val)?.color || "bg-gray-100";

  // --- GESTION DU FORMULAIRE (AJOUT OU MODIFICATION) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;

    if (editingId) {
      // MODE MODIFICATION
      const { error } = await supabase
        .from('applications')
        .update(newApp)
        .eq('id', editingId);

      if (error) {
        alert("Erreur modification : " + error.message);
      } else {
        setApplications(applications.map(app => app.id === editingId ? { ...newApp, id: editingId } : app));
        resetForm();
      }

    } else {
      // MODE AJOUT (Comme avant)
      const { data, error } = await supabase
        .from('applications')
        .insert([newApp])
        .select();

      if (error) {
        console.error("ERREUR:", error);
        alert(`Erreur ajout : ${error.message}. Vérifie la colonne contact_email dans Supabase.`);
      } else if (data) {
        setApplications([data[0], ...applications]);
        resetForm();
      }
    }
  };

  // Préparer le formulaire pour éditer une ligne
  const handleEditClick = (app) => {
    setNewApp(app);
    setEditingId(app.id);
    // Remonter en haut de page pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewApp({
      company: "",
      role: "",
      status: "A faire",
      location: "",
      source: "LinkedIn",
      contact_email: "",
      date: new Date().toISOString().split('T')[0],
      relanceDone: false
    });
    setEditingId(null); // On quitte le mode édition
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ?")) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (!error) setApplications(applications.filter(app => app.id !== id));
    }
  };

  // Modification rapide (statut, checkbox) directement dans le tableau
  const handleQuickChange = async (id, field, value) => {
    setApplications(applications.map(app => app.id === id ? { ...app, [field]: value } : app));
    await supabase.from('applications').update({ [field]: value }).eq('id', id);
  };

  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Lieu", "Source", "Email Contact", "Date Envoi", "Relance J+10", "Relance Faite"];
    const rows = applications.map(app => [
      `"${app.company}"`, `"${app.role}"`, `"${app.status}"`, `"${app.location}"`, `"${app.source}"`, `"${app.contact_email || ''}"`, `"${app.date}"`, `"${calculateRelanceDate(app.date)}"`, `"${app.relanceDone ? 'OUI' : 'NON'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "suivi_cloud.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // FILTRE DE RECHERCHE
  const filteredApplications = applications.filter(app => 
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Briefcase className="text-blue-600"/> Suivi Cloud ☁️</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? "Chargement..." : `${filteredApplications.length} candidature(s)`}</p>
          </div>
          
          {/* BARRE DE RECHERCHE */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm"><FileSpreadsheet size={18}/> Export CSV</button>
        </div>

        {/* FORMULAIRE (Mode Ajout ou Édition) */}
        <div className={`p-6 rounded-xl shadow-sm border transition-colors ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {editingId ? <><Pencil size={20} className="text-orange-600" /> Modifier la candidature</> : <><Plus size={20} className="text-blue-600" /> Ajouter une ligne</>}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"><X size={16}/> Annuler</button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3 lg:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label><div className="relative"><Building2 className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.company} onChange={(e)=>setNewApp({...newApp, company: e.target.value})} required /></div></div>
            <div className="md:col-span-3 lg:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label><div className="relative"><Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Dev" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.role} onChange={(e)=>setNewApp({...newApp, role: e.target.value})} required /></div></div>
            <div className="md:col-span-2 lg:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu</label><div className="relative"><MapPin className="absolute left-3 top-2.5 text-gray-400" size={16}/><input type="text" placeholder="Paris" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={newApp.location} onChange={(e)=>setNewApp({...newApp, location: e.target.value})} /></div></div>
            
            {/* SOURCE & EMAIL CONDITIONNEL */}
            <div className={`md:col-span-2 lg:col-span-2 ${newApp.source === "Contact direct" ? "flex gap-2" : ""}`}>
              <div className="w-full">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={newApp.source} onChange={(e)=>setNewApp({...newApp, source: e.target.value})}>{sourceOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}</select>
              </div>
            </div>
            
            {/* Si Contact direct selectionné, on affiche l'email */}
            {newApp.source === "Contact direct" && (
              <div className="md:col-span-2 lg:col-span-2 animate-fadeIn">
                <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Email Contact</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-blue-400" size={16}/>
                  <input type="email" placeholder="rh@boite.com" className="w-full pl-9 pr-3 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newApp.contact_email || ''} onChange={(e)=>setNewApp({...newApp, contact_email: e.target.value})} />
                </div>
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newApp.date} onChange={(e)=>setNewApp({...newApp, date: e.target.value})} required /></div>
            
            <div className="md:col-span-2 lg:col-span-2">
              <button type="submit" className={`w-full py-2 text-white rounded-lg font-medium flex justify-center items-center gap-2 text-sm transition-colors ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <><Pencil size={16}/> Modifier</> : <><Plus size={16}/> Ajouter</>}
              </button>
            </div>
          </form>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider"><th className="p-4">Entreprise</th><th className="p-4">Poste</th><th className="p-4">Statut</th><th className="p-4">Lieu</th><th className="p-4">Source</th><th className="p-4">Date</th><th className="p-4">Relance</th><th className="p-4 text-center">Fait ?</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? <tr><td colSpan="9" className="p-8 text-center text-gray-500">Chargement...</td></tr> : filteredApplications.map((app) => (
                  <tr key={app.id} className={`hover:bg-gray-50 ${editingId === app.id ? 'bg-yellow-50' : ''}`}>
                    <td className="p-4 font-bold">{app.company}</td>
                    <td className="p-4">{app.role}</td>
                    <td className="p-4"><select value={app.status} onChange={(e)=>handleQuickChange(app.id, 'status', e.target.value)} className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>{statusOptions.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></td>
                    <td className="p-4 flex gap-1 items-center"><MapPin size={14} className="text-gray-400"/> {app.location||"-"}</td>
                    
                    {/* Colonne Source avec Email */}
                    <td className="p-4">
                      <div className="text-gray-700">{app.source}</div>
                      {app.source === "Contact direct" && app.contact_email && (
                        <div className="text-xs text-blue-600 flex items-center gap-1 mt-1"><Mail size={10}/> {app.contact_email}</div>
                      )}
                    </td>
                    
                    <td className="p-4 whitespace-nowrap">{new Date(app.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 whitespace-nowrap"><div className="flex gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded border-orange-100 w-fit"><Calendar size={12}/> {calculateRelanceDate(app.date)}</div></td>
                    <td className="p-4 text-center"><button onClick={()=>handleQuickChange(app.id, 'relanceDone', !app.relanceDone)} className={`p-1.5 rounded ${app.relanceDone?'bg-green-100 text-green-600':'bg-gray-100 text-gray-400'}`}><CheckSquare size={20} className={app.relanceDone?"fill-current":""}/></button></td>
                    
                    {/* ACTIONS : ÉDITER & SUPPRIMER */}
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditClick(app)} className="text-gray-400 hover:text-blue-600 p-1" title="Modifier"><Pencil size={18}/></button>
                      <button onClick={() => handleDelete(app.id)} className="text-gray-400 hover:text-red-500 p-1" title="Supprimer"><Trash2 size={18}/></button>
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