// src/components/TachesEmploye.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/client";

export default function TachesEmploye({ utilisateurId, datePresence }) {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaches();
  }, [utilisateurId, datePresence]);

  const fetchTaches = async () => {
    if (!utilisateurId) return;

    setLoading(true);

    // Récupérer les tâches de l'utilisateur pour le jour de la présence
    const datePresenceFormatee = new Date(datePresence)
      .toISOString()
      .split("T")[0]; // Format YYYY-MM-DD

    const { data, error } = await supabase
      .from("taches")
      .select("*")
      .eq("utilisateur_id", utilisateurId)
      .eq("date", datePresenceFormatee) // Comparaison directe avec la date
      .order("created_at", { ascending: true });

    console.log("Date présence recherchée:", datePresenceFormatee);
    console.log("Tâches récupérées pour l'utilisateur:", utilisateurId, data);

    if (!error) {
      setTaches(data || []);
    }
    setLoading(false);
  };

  const validerTacheDefinitivement = async (tacheId) => {
    const { error } = await supabase
      .from("taches")
      .update({ statut: "terminee" })
      .eq("id", tacheId);

    if (!error) {
      fetchTaches(); // Recharger les tâches après validation
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Chargement des tâches...</span>
      </div>
    );
  }

  if (taches.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-xl">
        <div className="bg-gray-200 text-gray-400 p-3 rounded-full inline-block mb-2">
          <span className="text-lg">📋</span>
        </div>
        <p className="text-gray-500 text-sm">
          Aucune tâche assignée pour ce jour
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {taches.map((tache) => (
        <div
          key={tache.id}
          className={`rounded-xl border-2 p-4 transition-all duration-200 ${
            tache.statut === "terminee"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm"
              : tache.statut === "attente_validation_admin"
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm"
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`p-1 rounded-full ${
                    tache.statut === "terminee"
                      ? "bg-green-500 text-white"
                      : tache.statut === "attente_validation_admin"
                      ? "bg-amber-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <span className="text-sm">
                    {tache.statut === "terminee"
                      ? "✅"
                      : tache.statut === "attente_validation_admin"
                      ? "⏳"
                      : "🔄"}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800">{tache.titre}</h4>
              </div>

              <p className="text-sm text-gray-600 mb-3">{tache.description}</p>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  tache.statut === "terminee"
                    ? "bg-green-100 text-green-800"
                    : tache.statut === "attente_validation_admin"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {tache.statut === "terminee"
                  ? "✅ Terminée et validée"
                  : tache.statut === "attente_validation_admin"
                  ? "⏳ En attente de validation admin"
                  : "🔄 En cours"}
              </div>
            </div>

            {tache.statut === "attente_validation_admin" && (
              <button
                onClick={() => validerTacheDefinitivement(tache.id)}
                className="ml-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>✅</span>
                <span>Valider définitivement</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
