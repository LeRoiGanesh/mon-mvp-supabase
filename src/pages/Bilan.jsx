// src/pages/Bilan.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/client";
import { useNavigate } from "react-router-dom";

export default function Bilan() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreEmploye, setFiltreEmploye] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTachesHistorique();
  }, []);

  const fetchTachesHistorique = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("taches")
      .select(
        `
        id,
        titre,
        description,
        statut,
        date,
        created_at,
        utilisateur_id,
        utilisateurs!utilisateur_id ( nom, email )
      `
      )
      .order("date", { ascending: false });

    console.log("Historique des tâches récupéré :", data);
    console.log("Erreur :", error);

    if (!error) setTaches(data);
    setLoading(false);
  };

  const genererExemplesTaches = async () => {
    // Récupérer les utilisateurs Antoine et Benjamin
    const { data: utilisateurs, error: errorUsers } = await supabase
      .from("utilisateurs")
      .select("*")
      .in("nom", ["Antoine", "Benjamin"]);

    if (errorUsers || !utilisateurs || utilisateurs.length === 0) {
      alert(
        "Aucun utilisateur Antoine ou Benjamin trouvé. Créez-les d'abord via les connexions."
      );
      return;
    }

    const exemplesTaches = [
      // Tâches pour Antoine
      {
        titre: "Installation automate Schneider M580",
        description:
          "Montage et câblage de l'automate principal M580 en armoire électrique avec modules d'E/S",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Antoine")?.id,
        date: "2025-01-02",
        statut: "terminee",
      },
      {
        titre: "Configuration réseau Ethernet industriel",
        description:
          "Paramétrage du switch industriel et création du réseau Ethernet pour communication machines",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Antoine")?.id,
        date: "2025-01-02",
        statut: "terminee",
      },
      {
        titre: "Installation variateurs de fréquence ABB",
        description:
          "Montage et raccordement de 3 variateurs ACS880 pour motorisation convoyeurs",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Antoine")?.id,
        date: "2025-01-03",
        statut: "terminee",
      },
      {
        titre: "Programmation automate Unity Pro",
        description:
          "Développement du programme automate avec gestion sécurités et séquences production",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Antoine")?.id,
        date: "2025-01-04",
        statut: "attente_validation_admin",
      },
      // Tâches pour Benjamin
      {
        titre: "Câblage armoire électrique principale",
        description:
          "Réalisation du câblage puissance et contrôle selon schémas électriques fournis",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Benjamin")?.id,
        date: "2025-01-02",
        statut: "terminee",
      },
      {
        titre: "Installation capteurs de sécurité SICK",
        description:
          "Montage et raccordement des barrières immatérielles et arrêts d'urgence",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Benjamin")?.id,
        date: "2025-01-02",
        statut: "terminee",
      },
      {
        titre: "Mise en place système de vision Cognex",
        description:
          "Installation et calibrage caméras de contrôle qualité sur ligne de production",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Benjamin")?.id,
        date: "2025-01-03",
        statut: "terminee",
      },
      {
        titre: "Configuration IHM Wonderware",
        description:
          "Paramétrage de l'interface homme-machine avec synoptiques et alarmes",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Benjamin")?.id,
        date: "2025-01-04",
        statut: "en_cours",
      },
      {
        titre: "Tests fonctionnels système complet",
        description:
          "Validation du fonctionnement global de l'installation avec cycles de test",
        utilisateur_id: utilisateurs.find((u) => u.nom === "Benjamin")?.id,
        date: "2025-01-05",
        statut: "en_cours",
      },
    ];

    // Insérer les exemples de tâches
    const { error } = await supabase.from("taches").insert(exemplesTaches);

    if (!error) {
      alert("Exemples de tâches génie industriel créés avec succès !");
      fetchTachesHistorique();
    } else {
      console.error("Erreur lors de la création des exemples :", error);
      alert("Erreur lors de la création des exemples : " + error.message);
    }
  };

  const tachesFiltrees = taches.filter((tache) => {
    const filtreEmployeOk =
      filtreEmploye === "tous" || tache.utilisateurs?.nom === filtreEmploye;

    const filtreStatutOk =
      filtreStatut === "tous" || tache.statut === filtreStatut;

    return filtreEmployeOk && filtreStatutOk;
  });

  const getStatutColor = (statut) => {
    switch (statut) {
      case "terminee":
        return "text-green-600 bg-green-100";
      case "en_cours":
        return "text-blue-600 bg-blue-100";
      case "attente_validation_admin":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "terminee":
        return "✅ Terminée";
      case "en_cours":
        return "🔄 En cours";
      case "attente_validation_admin":
        return "⏳ En attente validation";
      default:
        return statut;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          📊 Bilan des tâches - Installation génie industriel
        </h1>
        <div className="flex gap-2">
          <button
            onClick={genererExemplesTaches}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
          >
            Générer exemples
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
          >
            Retour dashboard
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">🔍 Filtres</h3>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employé :</label>
            <select
              value={filtreEmploye}
              onChange={(e) => setFiltreEmploye(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="tous">Tous</option>
              <option value="Antoine">Antoine</option>
              <option value="Benjamin">Benjamin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut :</label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="tous">Tous</option>
              <option value="terminee">Terminée</option>
              <option value="en_cours">En cours</option>
              <option value="attente_validation_admin">
                En attente validation
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h4 className="font-semibold text-green-800">Tâches terminées</h4>
          <p className="text-2xl font-bold text-green-600">
            {taches.filter((t) => t.statut === "terminee").length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h4 className="font-semibold text-blue-800">Tâches en cours</h4>
          <p className="text-2xl font-bold text-blue-600">
            {taches.filter((t) => t.statut === "en_cours").length}
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <h4 className="font-semibold text-orange-800">
            En attente validation
          </h4>
          <p className="text-2xl font-bold text-orange-600">
            {
              taches.filter((t) => t.statut === "attente_validation_admin")
                .length
            }
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <h4 className="font-semibold text-gray-800">Total tâches</h4>
          <p className="text-2xl font-bold text-gray-600">{taches.length}</p>
        </div>
      </div>

      {loading ? (
        <p>Chargement de l'historique...</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            📋 Historique ({tachesFiltrees.length} tâche
            {tachesFiltrees.length > 1 ? "s" : ""})
          </h3>

          {tachesFiltrees.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded text-center">
              <p className="text-gray-600">
                Aucune tâche trouvée avec ces filtres.
              </p>
              <button
                onClick={genererExemplesTaches}
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Générer des exemples de tâches
              </button>
            </div>
          ) : (
            tachesFiltrees.map((tache) => (
              <div
                key={tache.id}
                className="border p-4 rounded bg-white shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{tache.titre}</h4>
                    <p className="text-gray-600 mb-2">{tache.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">
                        👷 {tache.utilisateurs?.nom || "Utilisateur inconnu"}
                      </span>
                      <span>
                        📅 {new Date(tache.date).toLocaleDateString()}
                      </span>
                      <span>
                        🕐 Créée le{" "}
                        {new Date(tache.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getStatutColor(
                      tache.statut
                    )}`}
                  >
                    {getStatutLabel(tache.statut)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
