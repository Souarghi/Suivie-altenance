import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Briefcase, Building2, MapPin, Globe, Calendar, CheckSquare, FileSpreadsheet } from 'lucide-react';

const App = () => {
  // 1. CHARGEMENT / INITIALISATION
  const [applications, setApplications] = useState(() => {
    const savedData = localStorage.getItem("suivi_alternance_v2");
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      // Données de démo mises à jour avec les nouveaux champs
      return [
        { 
          id: 1, 
          company: "Thales", 
          role: "Développeur Fullstack", 
          status: "Postulé", 
          location: "Paris, La Défense", 
          source: "Site de l'entreprise", 
          date: "2026-02-04", 
          relanceDone: false 
        },
        { 
          id: 2, 
          company: "L'Oréal", 
          role: "Assistant Marketing", 
          status: "Entretien", 
          location: "Clichy", 
          source: "LinkedIn", 
          date: "2026-02-01", 
          relanceDone: true 
        },
      ];
    }
  });

  // État pour le formulaire d'ajout
  const [newApp, setNewApp] = useState({
    company: "",
    role: "",
    status: "A faire",
    location: "",
    source: "LinkedIn",
    date: new Date().toISOString().split('T')[0],
    relanceDone: false
  });

  // 2. SAUVEGARDE AUTOMATIQUE
  useEffect(() => {
    localStorage.setItem("suivi_alternance_v2", JSON.stringify(applications));
  }, [applications]);

  // Options pour les menus déroulants
  const statusOptions = [
    { value: "A faire", label: "À faire", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { value: "Postulé", label: "Postulé", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "Entretien", label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "Accepté", label: "Accepté", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "Refusé", label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  ];

  const sourceOptions = [
    "LinkedIn",
    "JobTeaser",
    "Contact direct",
    "Site de l'entreprise",
    "Indeed",
    "Welcome to the Jungle",
    "Autre"
  ];

  // 3. FONCTIONS UTILITAIRES
  
  // Calcul de la date de relance (J+10)
  const calculateRelanceDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusStyle = (statusVal) => {
    const option = statusOptions.find(o => o.value === statusVal);
    return option ? option.color : "bg-gray-100";
  };

  // 4. GESTIONNAIRES D'EVENTS (HANDLERS)
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;
    setApplications([...applications, { ...newApp, id: Date.now() }]);
    // Reset du formulaire
    setNewApp({
      company: "",
      role: "",
      status: "A faire",
      location: "",
      source: "LinkedIn",
      date: new Date().toISOString().split('T')[0],
      relanceDone: false
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette ligne ?")) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, [field]: value } : app
    ));
  };

  const exportToCSV = () => {
    const headers = ["Entreprise", "Poste", "Statut", "Lieu", "Source", "Date Envoi", "Date Relance (J+10)", "Relance Faite"];
    const rows = applications.map(app => [
      `"${app.company}"`,
      `"${app.role}"`,
      `"${app.status}"`,
      `"${app.location}"`,
      `"${app.source}"`,
      `"${app.date}"`,
      `"${calculateRelanceDate(app.date)}"`,
      `"${app.relanceDone ? 'OUI' : 'NON'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "suivi_candidatures_complet.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-[95%] mx-auto space-y-6"> {/* max-w agrandi pour le gros tableau */}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Suivi Candidatures Avancé
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {applications.length} ligne(s) | Prochaine relance le : {applications.length > 0 ? calculateRelanceDate(applications[0].date) : '-'}
            </p>
          </div>
          <button onClick={exportToCSV} className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <FileSpreadsheet size={18} /> Export Excel/CSV
          </button>
        </div>

        {/* Formulaire d'ajout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-600" /> Ajouter une ligne</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-3 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Entreprise</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Thales" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.company} onChange={(e) => setNewApp({...newApp, company: e.target.value})} required />
              </div>
            </div>

            <div className="md:col-span-3 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Poste</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Dev Java" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.role} onChange={(e) => setNewApp({...newApp, role: e.target.value})} required />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Lieu</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Paris" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.location} onChange={(e) => setNewApp({...newApp, location: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Source</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" value={newApp.source} onChange={(e) => setNewApp({...newApp, source: e.target.value})}>
                {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date envoi</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newApp.date} onChange={(e) => setNewApp({...newApp, date: e.target.value})} required />
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 text-sm"><Plus size={16} /> Ajouter</button>
            </div>
          </form>
        </div>

        {/* Tableau Complet */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Entreprise</th>
                  <th className="p-4">Intitulé du poste</th>
                  <th className="p-4">État d'avancement</th>
                  <th className="p-4">Lieu</th>
                  <th className="p-4">Source (Où j'ai postulé)</th>
                  <th className="p-4">Date envoi</th>
                  <th className="p-4">Relance (J+10)</th>
                  <th className="p-4 text-center">Relancé ?</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {applications.length === 0 ? (
                    <tr><td colSpan="9" className="p-8 text-center text-gray-500">Aucune donnée. Commencez par ajouter une candidature.</td></tr>
                ) : applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* Entreprise */}
                    <td className="p-4 font-bold text-gray-900">{app.company}</td>
                    
                    {/* Poste */}
                    <td className="p-4 text-gray-700">{app.role}</td>
                    
                    {/* État (Select) */}
                    <td className="p-4">
                      <select 
                        value={app.status} 
                        onChange={(e) => handleChange(app.id, 'status', e.target.value)} 
                        className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-bold border focus:ring-2 outline-none cursor-pointer transition-colors ${getStatusStyle(app.status)}`}
                      >
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white text-gray-900">{opt.label}</option>)}
                      </select>
                    </td>

                    {/* Lieu */}
                    <td className="p-4 text-gray-600">
                         <div className="flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {app.location || "-"}</div>
                    </td>

                    {/* Source (Select in table) */}
                    <td className="p-4">
                      <select 
                        value={app.source} 
                        onChange={(e) => handleChange(app.id, 'source', e.target.value)} 
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none py-1 text-gray-600 cursor-pointer w-full"
                      >
                         {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>

                    {/* Date Envoi */}
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(app.date).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Date Relance (Calculée) */}
                    <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 w-fit">
                            <Calendar size={12} />
                            {calculateRelanceDate(app.date)}
                        </div>
                    </td>

                    {/* Checkbox Relance */}
                    <td className="p-4 text-center">
                        <button 
                            onClick={() => handleChange(app.id, 'relanceDone', !app.relanceDone)}
                            className={`p-1.5 rounded transition-colors ${app.relanceDone ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            <CheckSquare size={20} className={app.relanceDone ? "fill-current" : ""} />
                        </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(app.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
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