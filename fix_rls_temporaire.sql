-- Script de correction temporaire pour résoudre les problèmes RLS
-- Exécutez ces commandes dans l'interface SQL de Supabase

-- 1. Désactiver temporairement RLS sur la table taches
ALTER TABLE taches DISABLE ROW LEVEL SECURITY;

-- 2. Mettre à jour la contrainte CHECK pour accepter le nouveau statut
ALTER TABLE taches DROP CONSTRAINT IF EXISTS taches_statut_check;
ALTER TABLE taches ADD CONSTRAINT taches_statut_check 
  CHECK (statut IN ('en_cours', 'attente_validation_admin', 'terminee'));

-- 3. Optionnel: Voir tous les utilisateurs authentifiés
-- SELECT * FROM auth.users;

-- 4. Optionnel: Voir tous les utilisateurs dans votre table personnalisée
-- SELECT * FROM utilisateurs;

-- 5. Optionnel: Voir toutes les tâches
-- SELECT * FROM taches;

-- Une fois que tout fonctionne, vous pourrez réactiver RLS avec:
-- ALTER TABLE taches ENABLE ROW LEVEL SECURITY;
