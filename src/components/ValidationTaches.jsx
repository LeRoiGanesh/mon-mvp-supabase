// src/components/ValidationTaches.jsx
import { useState } from "react";
import { supabase } from "../lib/client";

export default function ValidationTaches({ taches, onTacheValidee }) {
  const [validatingTaches, setValidatingTaches] = useState(new Set());

  const validerTache = async (tacheId) => {
    console.log("Tentative de validation de la tâche:", tacheId);
    setValidatingTaches((prev) => new Set(prev).add(tacheId));

    console.log("Mise à jour du statut vers: attente_validation_admin");
    const { data, error } = await supabase
      .from("taches")
      .update({ statut: "attente_validation_admin" })
      .eq("id", tacheId);

    console.log("Résultat de la mise à jour:", { data, error });

    if (!error) {
      console.log(
        "Tâche marquée comme terminée, en attente de validation admin"
      );
      onTacheValidee?.(tacheId);
    } else {
      console.error("Erreur lors de la validation:", error);
      alert("Erreur lors de la validation de la tâche: " + error.message);
    }

    setValidatingTaches((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tacheId);
      return newSet;
    });
  };

  const tachesEnCours = taches.filter((t) => t.statut === "en_cours");
  const tachesEnAttente = taches.filter(
    (t) => t.statut === "attente_validation_admin"
  );
  const tachesTerminees = taches.filter((t) => t.statut === "terminee");

  console.log("ValidationTaches - Debug:", {
    totalTaches: taches.length,
    tachesEnCours: tachesEnCours.length,
    tachesEnAttente: tachesEnAttente.length,
    tachesTerminees: tachesTerminees.length,
    statutsUniques: [...new Set(taches.map((t) => t.statut))],
  });

  if (taches.length === 0) {
    return (
      <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="bg-gray-200 text-gray-400 p-4 rounded-full inline-block mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Aucune tâche assignée
        </h3>
        <p className="text-gray-500">
          Aucune tâche n'est programmée pour aujourd'hui (
          {new Date().toISOString().split("T")[0]})
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <span className="text-lg">🔄</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">
                {tachesEnCours.length}
              </p>
              <p className="text-sm text-blue-600">En cours</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-full">
              <span className="text-lg">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-800">
                {tachesEnAttente.length}
              </p>
              <p className="text-sm text-amber-600">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 text-white p-2 rounded-full">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">
                {tachesTerminees.length}
              </p>
              <p className="text-sm text-green-600">Terminées</p>
            </div>
          </div>
        </div>
      </div>

      {tachesEnCours.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <h3 className="font-bold text-white text-lg flex items-center space-x-2">
              <span>�</span>
              <span>Tâches en cours ({tachesEnCours.length})</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {tachesEnCours.map((tache) => (
              <div
                key={tache.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {tache.titre}
                    </h4>
                    <p className="text-gray-600 text-sm">{tache.description}</p>
                  </div>
                  <button
                    onClick={() => validerTache(tache.id)}
                    disabled={validatingTaches.has(tache.id)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center space-x-2"
                  >
                    {validatingTaches.has(tache.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Marquer terminée</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tachesEnAttente.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
            <h3 className="font-bold text-white text-lg flex items-center space-x-2">
              <span>⏳</span>
              <span>
                Tâches en attente de validation ({tachesEnAttente.length})
              </span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {tachesEnAttente.map((tache) => (
              <div
                key={tache.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 opacity-75">
                    <h4 className="font-semibold text-gray-600 mb-1 line-through">
                      {tache.titre}
                    </h4>
                    <p className="text-gray-500 text-sm line-through">
                      {tache.description}
                    </p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                    <span>⏳</span>
                    <span>En attente validation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tachesTerminees.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
            <h3 className="font-bold text-white text-lg flex items-center space-x-2">
              <span>✅</span>
              <span>Tâches terminées ({tachesTerminees.length})</span>
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {tachesTerminees.map((tache) => (
              <div
                key={tache.id}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {tache.titre}
                    </h4>
                    <p className="text-gray-600 text-sm">{tache.description}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                    <span>✅</span>
                    <span>Terminée</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
