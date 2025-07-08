-- Création des tables pour l'application de gestion de présence

-- Table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255),
    role VARCHAR(50) DEFAULT 'employe' CHECK (role IN ('employe', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table presences
CREATE TABLE IF NOT EXISTS presences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_arrivee TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_depart TIMESTAMP,
    photo_url TEXT,
    statut_validation VARCHAR(50) DEFAULT 'en_cours' CHECK (statut_validation IN ('en_cours', 'en_attente', 'valide')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table taches
CREATE TABLE IF NOT EXISTS taches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
    titre TEXT NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'attente_validation_admin', 'terminee')),
    note_admin INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Politiques RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE taches ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs
-- Les utilisateurs peuvent voir leurs propres données
CREATE POLICY "Les utilisateurs peuvent voir leurs propres données" ON utilisateurs
    FOR SELECT USING (auth.uid()::text = id::text);

-- Les admins peuvent voir tous les utilisateurs
CREATE POLICY "Les admins peuvent voir tous les utilisateurs" ON utilisateurs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Les utilisateurs peuvent s'inscrire
CREATE POLICY "Les utilisateurs peuvent s'inscrire" ON utilisateurs
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Politique alternative : les utilisateurs authentifiés peuvent s'insérer
CREATE POLICY "Utilisateurs authentifiés peuvent s'insérer" ON utilisateurs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Politique pour les présences
-- Les employés peuvent voir leurs propres présences
CREATE POLICY "Les employés peuvent voir leurs propres présences" ON presences
    FOR SELECT USING (auth.uid()::text = utilisateur_id::text);

-- Les employés peuvent créer leurs propres présences
CREATE POLICY "Les employés peuvent créer leurs propres présences" ON presences
    FOR INSERT WITH CHECK (auth.uid()::text = utilisateur_id::text);

-- Les employés peuvent modifier leurs propres présences
CREATE POLICY "Les employés peuvent modifier leurs propres présences" ON presences
    FOR UPDATE USING (auth.uid()::text = utilisateur_id::text);

-- Les admins peuvent voir toutes les présences
CREATE POLICY "Les admins peuvent voir toutes les présences" ON presences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Les admins peuvent modifier toutes les présences
CREATE POLICY "Les admins peuvent modifier toutes les présences" ON presences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Politique pour les tâches
-- Les employés peuvent voir leurs propres tâches
CREATE POLICY "Les employés peuvent voir leurs propres tâches" ON taches
    FOR SELECT USING (auth.uid()::text = utilisateur_id::text);

-- Les employés peuvent modifier leurs propres tâches
CREATE POLICY "Les employés peuvent modifier leurs propres tâches" ON taches
    FOR UPDATE USING (auth.uid()::text = utilisateur_id::text);

-- Politique alternative : les utilisateurs authentifiés peuvent modifier leurs tâches
CREATE POLICY "Utilisateurs authentifiés peuvent modifier leurs tâches" ON taches
    FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid()::text = utilisateur_id::text);

-- Les admins peuvent voir toutes les tâches
CREATE POLICY "Les admins peuvent voir toutes les tâches" ON taches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Les admins peuvent créer des tâches
CREATE POLICY "Les admins peuvent créer des tâches" ON taches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Les admins peuvent modifier toutes les tâches
CREATE POLICY "Les admins peuvent modifier toutes les tâches" ON taches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
        )
    );

-- Créer le bucket pour les photos (à exécuter dans l'interface Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Politiques pour le storage (bucket photos)
-- CREATE POLICY "Les utilisateurs peuvent uploader leurs photos" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Les photos sont visibles par tous" ON storage.objects
--     FOR SELECT USING (bucket_id = 'photos');
