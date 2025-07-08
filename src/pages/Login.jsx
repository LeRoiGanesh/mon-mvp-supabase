// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for the magic link!");
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data, error } = await supabase
          .from("utilisateurs")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (data?.role === "admin") navigate("/admin");
        else navigate("/employe");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Header avec logo/titre */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl inline-block mb-4 shadow-xl">
          <h1 className="text-3xl font-bold">🏗️ ChantierPro</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Gestion de présence et tâches industrielles
        </p>
      </div>

      {/* Carte de connexion */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
          <p className="text-gray-500">Accédez à votre espace de travail</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="votre.email@entreprise.com"
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                📧
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🚀 Envoyer le lien magique
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Un lien de connexion sécurisé sera envoyé à votre email
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>© 2025 ChantierPro - Solution de gestion industrielle</p>
      </div>
    </div>
  );
}
