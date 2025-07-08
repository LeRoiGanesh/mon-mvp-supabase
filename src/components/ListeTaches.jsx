// src/components/ListeTaches.jsx
import { useState } from "react";
import { supabase } from "../lib/client";

export default function ListeTaches({ taches: initialTaches }) {
  const [taches, setTaches] = useState(initialTaches);

  const toggleStatut = async (tache) => {
    const nouveauStatut = tache.statut === "termine" ? "a_faire" : "termine";

    const { error } = await supabase
      .from("taches")
      .update({ statut: nouveauStatut })
      .eq("id", tache.id);

    if (!error) {
      const nouvellesTaches = taches.map((t) =>
        t.id === tache.id ? { ...t, statut: nouveauStatut } : t
      );
      setTaches(nouvellesTaches);
    } else {
      alert("Erreur de mise à jour : " + error.message);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">📋 Mes tâches</h2>

      {taches.length === 0 ? (
        <p>Aucune tâche assignée.</p>
      ) : (
        <ul className="space-y-3">
          {taches.map((tache) => (
            <li
              key={tache.id}
              className={`flex justify-between items-center p-3 rounded border ${
                tache.statut === "termine"
                  ? "bg-green-100 border-green-400 line-through"
                  : "bg-white"
              }`}
            >
              <span>
                <strong>{tache.titre}</strong> <br />
                <small>{new Date(tache.date).toLocaleDateString()}</small>
              </span>
              <button
                onClick={() => toggleStatut(tache)}
                className={`px-3 py-1 rounded text-sm ${
                  tache.statut === "termine"
                    ? "bg-gray-400 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {tache.statut === "termine" ? "Annuler" : "Marquer fait"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
