-- SOLUTION RAPIDE : Exécutez cette commande dans l'interface SQL de Supabase

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE taches DROP CONSTRAINT IF EXISTS taches_statut_check;

-- Ajouter la nouvelle contrainte CHECK avec le nouveau statut
ALTER TABLE taches ADD CONSTRAINT taches_statut_check 
  CHECK (statut IN ('en_cours', 'attente_validation_admin', 'terminee'));

-- Vérifier que la contrainte a été ajoutée
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'taches'::regclass 
AND contype = 'c';
