// src/components/AjoutTacheModal.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/client";

export default function AjoutTacheModal({ open, onClose, onTacheCree }) {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    utilisateur_id: "",
    titre: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    statut: "en_cours", // Statut par défaut
  });

  useEffect(() => {
    if (open) {
      // Récupérer directement les employés depuis la table utilisateurs
      const fetchEmployes = async () => {
        console.log("Début de la récupération des employés...");
        setLoading(true);

        const { data, error } = await supabase
          .from("utilisateurs")
          .select("id, nom, email, role")
          .eq("role", "employe");

        console.log("Données récupérées :", data);
        console.log("Erreur :", error);

        if (error) {
          console.error("Erreur lors de la récupération des employés :", error);
          alert(
            "Erreur lors de la récupération des employés : " + error.message
          );
        } else {
          console.log("Nombre d'employés trouvés:", data?.length || 0);
          setUtilisateurs(data || []);
        }

        setLoading(false);
      };

      fetchEmployes();
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.utilisateur_id || !form.titre) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const { error } = await supabase.from("taches").insert(form);
    if (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
      alert("Erreur : " + error.message);
      return;
    }

    // Réinitialiser le formulaire
    setForm({
      utilisateur_id: "",
      titre: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      statut: "en_cours",
    });

    onTacheCree(); // pour rafraîchir la liste
    onClose(); // fermer la modale
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <span className="text-xl">➕</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Créer une nouvelle tâche</h2>
                <p className="text-blue-100">Assignez une tâche à un employé</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors duration-200"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Sélection employé */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              👷 Employé assigné
            </label>
            <select
              name="utilisateur_id"
              value={form.utilisateur_id}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">
                {loading
                  ? "⏳ Chargement des employés..."
                  : "Sélectionner un employé"}
              </option>
              {utilisateurs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nom || u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📝 Titre de la tâche
            </label>
            <input
              type="text"
              name="titre"
              placeholder="ex: Installation automate Schneider M580"
              value={form.titre}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📄 Description détaillée
            </label>
            <textarea
              name="description"
              placeholder="Décrivez précisément la tâche à réaliser..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              📅 Date d'exécution
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Statut info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <span>ℹ️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Statut initial
                </p>
                <p className="text-xs text-blue-600">
                  La tâche sera créée avec le statut "En cours"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.utilisateur_id || !form.titre}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center space-x-2"
            >
              <span>✅</span>
              <span>Créer la tâche</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
