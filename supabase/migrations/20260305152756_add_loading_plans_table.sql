/*
  # Tabla para guardar planillas de carga

  1. Nueva Tabla
    - `loading_plans` - Almacena planillas de carga guardadas
      - `id` (uuid, primary key)
      - `plan_name` (text) - Nombre descriptivo de la planilla
      - `master_data` (jsonb) - Datos de los pallets (array de PalletData)
      - `search_ids` (jsonb) - IDs de búsquedas guardadas
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Política permisiva para desarrollo (permitir acceso público)

  3. Índices
    - Índice en plan_name para búsquedas rápidas
*/

CREATE TABLE IF NOT EXISTS loading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  master_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  search_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to loading plans"
  ON loading_plans
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_loading_plans_name ON loading_plans(plan_name);

CREATE OR REPLACE FUNCTION update_loading_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_loading_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_loading_plans_updated_at
      BEFORE UPDATE ON loading_plans
      FOR EACH ROW
      EXECUTE FUNCTION update_loading_plans_updated_at();
  END IF;
END $$;
