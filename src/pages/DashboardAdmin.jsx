// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/client";
import AjoutTacheModal from "../components/AjoutTacheModal";
import TachesEmploye from "../components/TachesEmploye";
import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAdmin = async () => {
      // Vérifier la session et créer l'utilisateur si nécessaire
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        await ensureUserExists(session.session.user, "admin");
      }

      fetchPresences();
    };

    initAdmin();
  }, []);

  const ensureUserExists = async (user, role = "employe") => {
    // Vérifier si l'utilisateur existe dans la table utilisateurs
    const { data: existingUser, error: checkError } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code === "PGRST116") {
      // L'utilisateur n'existe pas, le créer
      console.log(
        "Création de l'utilisateur admin dans la table utilisateurs..."
      );
      const { error: insertError } = await supabase
        .from("utilisateurs")
        .insert({
          id: user.id,
          email: user.email,
          nom: user.user_metadata?.name || user.email?.split("@")[0],
          role: role,
        });

      if (insertError) {
        console.error(
          "Erreur lors de la création de l'utilisateur admin:",
          insertError
        );
      } else {
        console.log("Utilisateur admin créé avec succès");
      }
    } else if (!checkError) {
      console.log("Utilisateur admin existe déjà:", existingUser);
    } else {
      console.error(
        "Erreur lors de la vérification de l'utilisateur admin:",
        checkError
      );
    }
  };

  const fetchPresences = async () => {
    setLoading(true);

    // Debug : obtenir l'utilisateur admin connecté
    const { data: session } = await supabase.auth.getSession();
    console.log("Admin connecté:", session.session?.user?.id);

    const { data, error } = await supabase
      .from("presences")
      .select(
        `
        id,
        utilisateur_id,
        date_arrivee,
        date_depart,
        photo_url,
        statut_validation,
        utilisateurs!utilisateur_id ( id, nom, email )
      `
      )
      .order("date_arrivee", { ascending: false });

    console.log("Données présences récupérées :", data);
    console.log("Erreur :", error);

    if (!error) setPresences(data);
    setLoading(false);
  };

  const validerDepart = async (presenceId, utilisateurId, datePresence) => {
    // Vérifier d'abord si toutes les tâches du jour sont terminées
    const datePresenceFormatee = new Date(datePresence)
      .toISOString()
      .split("T")[0]; // Format YYYY-MM-DD

    const { data: tachesNonTerminees, error: errorTaches } = await supabase
      .from("taches")
      .select("*")
      .eq("utilisateur_id", utilisateurId)
      .eq("date", datePresenceFormatee) // Comparaison directe avec la date
      .in("statut", ["en_cours", "attente_validation_admin"]); // Tâches non terminées

    if (errorTaches) {
      alert("Erreur lors de la vérification des tâches");
      return;
    }

    if (tachesNonTerminees && tachesNonTerminees.length > 0) {
      const tachesEnCours = tachesNonTerminees.filter(
        (t) => t.statut === "en_cours"
      ).length;
      const tachesEnAttente = tachesNonTerminees.filter(
        (t) => t.statut === "attente_validation_admin"
      ).length;

      let message = `Il reste ${tachesNonTerminees.length} tâche(s) non terminée(s) :\n`;
      if (tachesEnCours > 0)
        message += `- ${tachesEnCours} tâche(s) en cours\n`;
      if (tachesEnAttente > 0)
        message += `- ${tachesEnAttente} tâche(s) en attente de validation\n`;
      message += `\nVoulez-vous quand même valider le départ ?`;

      const confirm = window.confirm(message);
      if (!confirm) return;
    }

    const { error } = await supabase
      .from("presences")
      .update({ statut_validation: "valide" })
      .eq("id", presenceId);

    if (!error) {
      fetchPresences();
      alert("Départ validé avec succès !");
    } else {
      alert("Erreur lors de la validation du départ");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/");
    } else {
      alert("Erreur lors de la déconnexion : " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header administrateur */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl">
                <span className="text-xl">👨‍💼</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Tableau de bord Admin
                </h1>
                <p className="text-gray-500">
                  Gestion des équipes et supervision des tâches
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span className="text-lg">➕</span>
              <span>Créer une tâche</span>
            </button>
            <button
              onClick={() => navigate("/bilan")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span className="text-lg">📊</span>
              <span>Historique des tâches</span>
            </button>
            <button
              onClick={fetchPresences}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className={`text-lg ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⏳' : '🔄'}
              </span>
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AjoutTacheModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onTacheCree={fetchPresences}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-gray-700">
                Chargement des données...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {presences.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="bg-gray-100 text-gray-400 p-6 rounded-full inline-block mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucune présence enregistrée
                </h3>
                <p className="text-gray-500">
                  Les employés qui se connecteront apparaîtront ici
                </p>
              </div>
            ) : (
              presences.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Informations employé */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                            <span className="text-lg">👷</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {p.utilisateurs?.nom || p.utilisateurs?.email}
                            </h3>
                            <p className="text-gray-500">
                              {p.utilisateurs?.email}
                            </p>
                          </div>
                        </div>

                        {/* Horaires */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">🕐</span>
                            <span className="font-medium text-gray-700">
                              Arrivée :
                            </span>
                            <span className="text-gray-600">
                              {new Date(p.date_arrivee).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">🕐</span>
                            <span className="font-medium text-gray-700">
                              Départ :
                            </span>
                            <span className="text-gray-600">
                              {p.date_depart
                                ? new Date(p.date_depart).toLocaleString()
                                : "En cours"}
                            </span>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">
                            Statut :
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              p.statut_validation === "en_attente"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : p.statut_validation === "valide"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {p.statut_validation === "en_attente" &&
                              "⏳ En attente"}
                            {p.statut_validation === "valide" && "✅ Validé"}
                            {p.statut_validation === "present" && "🟢 Présent"}
                          </span>
                        </div>

                        {/* Tâches de l'employé */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                            <span>📋</span>
                            <span>Tâches du jour</span>
                          </h4>
                          <TachesEmploye
                            utilisateurId={p.utilisateur_id}
                            datePresence={p.date_arrivee}
                          />
                        </div>
                      </div>

                      {/* Photo et actions */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <img
                            src={`https://brudaqouzlpvhfkzpukd.supabase.co/storage/v1/object/public/photos/${p.photo_url}`}
                            alt="Photo de présence"
                            className="w-40 h-40 object-cover rounded-2xl border-4 border-white shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                            <span className="text-sm">📸</span>
                          </div>
                        </div>

                        {p.date_depart &&
                          p.statut_validation === "en_attente" && (
                            <button
                              onClick={() =>
                                validerDepart(
                                  p.id,
                                  p.utilisateur_id,
                                  p.date_arrivee
                                )
                              }
                              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                            >
                              <span>✅</span>
                              <span>Valider le départ</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
