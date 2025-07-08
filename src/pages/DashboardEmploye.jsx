// src/pages/DashboardEmploye.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/client";
import CheckInPhoto from "../components/CheckInPhoto";
import ValidationTaches from "../components/ValidationTaches";
import { useNavigate } from "react-router-dom";

export default function DashboardEmploye() {
  const [session, setSession] = useState(null);
  const [taches, setTaches] = useState([]);
  const [checkInDone, setCheckInDone] = useState(false);
  const [waitingForValidation, setWaitingForValidation] = useState(false);
  const [departRequested, setDepartRequested] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      console.log(
        "Utilisateur connecté:",
        data.session?.user?.email,
        "ID:",
        data.session?.user?.id
      );

      // Créer ou vérifier l'utilisateur dans la table utilisateurs
      if (data.session?.user) {
        await ensureUserExists(data.session.user);
      }
    });
  }, []);

  const ensureUserExists = async (user) => {
    // Vérifier si l'utilisateur existe dans la table utilisateurs
    const { data: existingUser, error: checkError } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code === "PGRST116") {
      // L'utilisateur n'existe pas, le créer
      console.log("Création de l'utilisateur dans la table utilisateurs...");
      const { error: insertError } = await supabase
        .from("utilisateurs")
        .insert({
          id: user.id,
          email: user.email,
          nom: user.user_metadata?.name || user.email?.split("@")[0],
          role: "employe",
        });

      if (insertError) {
        console.error(
          "Erreur lors de la création de l'utilisateur:",
          insertError
        );
      } else {
        console.log("Utilisateur créé avec succès");
      }
    } else if (!checkError) {
      console.log("Utilisateur existe déjà:", existingUser);
    } else {
      console.error(
        "Erreur lors de la vérification de l'utilisateur:",
        checkError
      );
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchTaches();
    checkValidationStatus();

    // Vérifier le statut de validation toutes les 30 secondes
    const interval = setInterval(checkValidationStatus, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const checkValidationStatus = async () => {
    if (!session) return;

    // Vérifier s'il y a une présence en attente de validation
    const { data, error } = await supabase
      .from("presences")
      .select("*")
      .eq("utilisateur_id", session.user.id)
      .eq("statut_validation", "en_attente")
      .order("date_arrivee", { ascending: false })
      .limit(1);

    console.log("Vérification validation:", { data, error });

    if (!error && data && data.length > 0) {
      setWaitingForValidation(true);
      setCheckInDone(true); // Garder l'employé dans la vue des tâches
      // Ne pas modifier departRequested ici - il doit être géré manuellement
    } else {
      // Vérifier s'il y a au moins une présence validée ou en cours
      const { data: anyPresence, error: presenceError } = await supabase
        .from("presences")
        .select("*")
        .eq("utilisateur_id", session.user.id)
        .is("date_depart", null) // Présence active (pas encore parti)
        .order("date_arrivee", { ascending: false })
        .limit(1);

      if (!presenceError && anyPresence && anyPresence.length > 0) {
        // Il y a une présence active (check-in fait, pas encore de départ)
        setCheckInDone(true);
        setWaitingForValidation(false);
        setDepartRequested(false); // Reset car pas de départ en attente
      } else {
        // Aucune présence active, retour au check-in
        setWaitingForValidation(false);
        setCheckInDone(false);
        setDepartRequested(false); // Reset complet
      }
    }
  };

  const fetchTaches = async () => {
    console.log("Récupération des tâches pour l'utilisateur:", session.user.id);

    // Récupérer les tâches du jour courant (format DATE)
    const aujourdhui = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    // Test: D'abord essayer de récupérer toutes les tâches sans filtre utilisateur
    console.log("Test: récupération de toutes les tâches...");
    const { data: testTaches, error: testError } = await supabase
      .from("taches")
      .select("*");

    console.log("Test - Toutes les tâches:", testTaches);
    console.log("Test - Erreur:", testError);

    // Test: vérifier l'utilisateur dans la table utilisateurs
    const { data: userCheck, error: userError } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("id", session.user.id);

    console.log("Utilisateur dans la table utilisateurs:", userCheck);
    console.log("Erreur utilisateur:", userError);

    // Puis essayer avec le filtre utilisateur
    const { data: allTaches, error: allError } = await supabase
      .from("taches")
      .select("*")
      .eq("utilisateur_id", session.user.id);

    console.log("TOUTES les tâches de l'utilisateur:", allTaches);
    console.log("Erreur pour utilisateur spécifique:", allError);

    const { data, error } = await supabase
      .from("taches")
      .select("*")
      .eq("utilisateur_id", session.user.id)
      .eq("date", aujourdhui) // Comparaison directe avec la date
      .order("created_at", { ascending: true });

    console.log("Date recherchée:", aujourdhui);
    console.log("Tâches récupérées:", data);
    console.log("Erreur:", error);
    console.log("Nombre de tâches trouvées:", data?.length || 0);

    // Debug détaillé de chaque tâche
    if (data && data.length > 0) {
      data.forEach((tache, index) => {
        console.log(`Tâche ${index + 1}:`, {
          id: tache.id,
          titre: tache.titre,
          statut: tache.statut,
          date: tache.date,
          utilisateur_id: tache.utilisateur_id,
        });
      });
    }

    if (!error) setTaches(data || []);
  };

  const handleCheckOut = async () => {
    console.log("Tentative de départ pour utilisateur:", session.user.id);

    const { data, error } = await supabase
      .from("presences")
      .update({
        date_depart: new Date().toISOString(),
        statut_validation: "en_attente",
      })
      .eq("utilisateur_id", session.user.id)
      .is("date_depart", null); // départ non encore enregistré

    console.log("Résultat update:", { data, error });

    if (!error) {
      setDepartRequested(true); // Marquer que l'employé a demandé le départ
      alert("Départ enregistré ! En attente de validation par l'admin.");
      setWaitingForValidation(true);
      checkValidationStatus(); // Re-vérifier le statut
    } else {
      alert(error.message);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header professionnel */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl">
                <span className="text-xl">👷</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Espace Employé
                </h1>
                <p className="text-gray-500">
                  Bonjour, bienvenue sur votre espace de travail
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

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!checkInDone ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-green-100 text-green-600 p-4 rounded-full inline-block mb-4">
                <span className="text-3xl">📸</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Déclarer votre arrivée
              </h2>
              <p className="text-gray-600">
                Prenez une photo pour confirmer votre présence sur le chantier
              </p>
            </div>
            <CheckInPhoto
              utilisateur_id={session?.user.id}
              onCheckIn={() => setCheckInDone(true)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {waitingForValidation && departRequested && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-amber-800 mb-2">
                      Départ en attente de validation
                    </h2>
                    <p className="text-amber-700">
                      Votre demande de départ a été transmise à
                      l'administrateur. Vous serez notifié une fois la
                      validation effectuée.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Mes tâches du jour
                  </h2>
                  <p className="text-gray-600">
                    Gérez vos tâches et suivez votre progression
                  </p>
                </div>
              </div>
              <ValidationTaches taches={taches} onTacheValidee={fetchTaches} />
            </div>

            <div className="text-center">
              <button
                onClick={handleCheckOut}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
              >
                <span className="text-xl">🏠</span>
                <span>Terminer ma journée</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
