/*
  # Create Airtable Credentials Table

  Stores Airtable API credentials for n8n workflow integration.
  Used by Settings component and airtableService.
*/

CREATE TABLE IF NOT EXISTS airtable_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  base_id text DEFAULT '',
  api_key text DEFAULT '',
  is_connected boolean DEFAULT false,
  last_tested timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE airtable_credentials ENABLE ROW LEVEL SECURITY;
