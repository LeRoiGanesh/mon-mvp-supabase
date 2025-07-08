// src/components/CheckInPhoto.jsx
import { useState } from "react";
import { supabase } from "../lib/client";

export default function CheckInPhoto({ utilisateur_id, onCheckIn }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Ajoute une photo.");

    // Vérifier l'authentification
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("Vous devez être connecté pour uploader une photo.");
      return;
    }

    // Vérifier s'il n'y a pas de présence en attente de validation
    const { data: pendingPresence, error: checkError } = await supabase
      .from("presences")
      .select("*")
      .eq("utilisateur_id", utilisateur_id)
      .eq("statut_validation", "en_attente");

    if (checkError) {
      alert("Erreur lors de la vérification : " + checkError.message);
      return;
    }

    if (pendingPresence && pendingPresence.length > 0) {
      alert(
        "❌ Vous avez un départ en attente de validation par l'administrateur. Vous ne pouvez pas faire un nouveau check-in tant que votre départ précédent n'est pas validé."
      );
      return;
    }

    setUploading(true);

    const filePath = `${utilisateur_id}_${Date.now()}.jpg`;

    const { data, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Erreur upload détaillée:", uploadError);
      alert("Erreur upload : " + uploadError.message);
      setUploading(false);
      return;
    }

    console.log("Création présence pour utilisateur_id:", utilisateur_id);
    console.log("Session utilisateur:", session.user.id);

    const { error: insertError } = await supabase.from("presences").insert({
      utilisateur_id,
      photo_url: data.path,
    });

    if (insertError) {
      alert("Erreur enregistrement présence : " + insertError.message);
    } else {
      alert("Présence enregistrée avec succès !");
      onCheckIn();
    }

    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <label className="block text-lg font-medium text-gray-700 mb-4">
          Sélectionnez votre photo de présence
        </label>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors duration-200 bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <span className="text-3xl">📷</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:duration-200"
              required
            />
            <p className="text-sm text-gray-500">
              Formats acceptés : JPG, PNG, HEIC • Max 10MB
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center space-x-3 mx-auto"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              <span className="text-xl">✅</span>
              <span>Confirmer mon arrivée</span>
            </>
          )}
        </button>
      </div>

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-full">
              <span>📋</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Photo sélectionnée</p>
              <p className="text-sm text-green-600">{file.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
