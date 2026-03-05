/*
  # Schema para Gestor de Carga de Pallets

  1. Nuevas Tablas
    - `loading_sessions`
      - `id` (uuid, primary key)
      - `session_name` (text) - Nombre descriptivo de la sesión
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - Para futuro soporte multiusuario
      
    - `master_pallets`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `container_id` (text) - ID del contenedor
      - `pallet_id` (text) - ID del pallet
      - `quantity` (integer)
      - `boxes` (integer)
      - `weight` (numeric)
      - `description` (text)
      - `original_row` (integer)
      
    - `search_history`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `pallet_ids` (jsonb) - Array de IDs buscados
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas permisivas para desarrollo (auth y anon pueden leer/escribir)
    
  3. Notas
    - Incluye índices para búsquedas rápidas por pallet_id y container_id
    - Timestamps automáticos con triggers
*/

-- Tabla de sesiones de carga
CREATE TABLE IF NOT EXISTS loading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name text NOT NULL DEFAULT 'Nueva sesión',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE loading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a sesiones"
  ON loading_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Tabla de pallets maestros
CREATE TABLE IF NOT EXISTS master_pallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES loading_sessions(id) ON DELETE CASCADE,
  container_id text NOT NULL,
  pallet_id text NOT NULL,
  quantity integer DEFAULT 0,
  boxes integer DEFAULT 0,
  weight numeric DEFAULT 0,
  description text DEFAULT '',
  original_row integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_pallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a pallets"
  ON master_pallets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_master_pallets_session ON master_pallets(session_id);
CREATE INDEX IF NOT EXISTS idx_master_pallets_pallet_id ON master_pallets(pallet_id);
CREATE INDEX IF NOT EXISTS idx_master_pallets_container ON master_pallets(container_id);

-- Tabla de historial de búsquedas
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES loading_sessions(id) ON DELETE CASCADE,
  pallet_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público al historial"
  ON search_history
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_loading_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_loading_sessions_updated_at
      BEFORE UPDATE ON loading_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;