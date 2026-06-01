-- Script para adicionar tabelas e colunas faltantes em todos os schemas de tenant
-- Executar para cada schema de tenant

DO $$
DECLARE
  schema_name TEXT;
  has_customers BOOLEAN;
BEGIN
  FOR schema_name IN
    SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%'
  LOOP
    RAISE NOTICE 'Updating schema: %', schema_name;

    -- Check if this is a "full" tenant schema (has customers table)
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = schema_name AND table_name = 'customers'
    ) INTO has_customers;

    -- notification_templates (safe for all schemas)
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.notification_templates (
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT ''COMMERCIAL'',
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        updated_by TEXT,
        CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
      );
    ', schema_name);

    EXECUTE format('
      CREATE UNIQUE INDEX IF NOT EXISTS notification_templates_name_key ON %I.notification_templates(name);
    ', schema_name);

    -- communication_history (safe for all schemas)
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS %I.communication_history (
        id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        template_name TEXT,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        recipient TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT ''SENT'',
        error_message TEXT,
        sent_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        CONSTRAINT communication_history_pkey PRIMARY KEY (id)
      );
    ', schema_name);

    -- Only modify tenant schemas that have the full structure (has customers table)
    IF has_customers THEN

      -- Add FK for communication_history -> customers
      EXECUTE format('
        DO $inner$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = %L AND table_name = ''communication_history'' 
            AND constraint_name = ''communication_history_customer_id_fkey''
          ) THEN
            ALTER TABLE %I.communication_history 
            ADD CONSTRAINT communication_history_customer_id_fkey 
            FOREIGN KEY (customer_id) REFERENCES %I.customers(id) ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $inner$;
      ', schema_name, schema_name, schema_name);

      -- receivables
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.receivables (
          id TEXT NOT NULL,
          contract_id TEXT,
          customer_id TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT ''RECURRING'',
          amount DECIMAL(65,30) NOT NULL,
          due_date TIMESTAMP(3) NOT NULL,
          status TEXT NOT NULL DEFAULT ''PENDING'',
          competence TEXT,
          renegotiation_id TEXT,
          boleto_url TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          updated_by TEXT,
          CONSTRAINT receivables_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      -- payments
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.payments (
          id TEXT NOT NULL,
          receivable_id TEXT NOT NULL,
          amount DECIMAL(65,30) NOT NULL,
          payment_date TIMESTAMP(3) NOT NULL,
          method TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT ''CONFIRMED'',
          receipt_url TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          CONSTRAINT payments_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      -- debt_renegotiations
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.debt_renegotiations (
          id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          original_debt DECIMAL(65,30) NOT NULL,
          interest_applied DECIMAL(65,30) NOT NULL DEFAULT 0,
          penalty_applied DECIMAL(65,30) NOT NULL DEFAULT 0,
          discount DECIMAL(65,30) NOT NULL DEFAULT 0,
          final_amount DECIMAL(65,30) NOT NULL,
          status TEXT NOT NULL DEFAULT ''PENDING'',
          consolidated_receivable_ids JSONB NOT NULL,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          updated_by TEXT,
          CONSTRAINT debt_renegotiations_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      -- adjustment_indexes
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.adjustment_indexes (
          id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          updated_by TEXT,
          CONSTRAINT adjustment_indexes_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      EXECUTE format('
        CREATE UNIQUE INDEX IF NOT EXISTS adjustment_indexes_name_key ON %I.adjustment_indexes(name);
      ', schema_name);

      -- tenant_settings
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.tenant_settings (
          id TEXT NOT NULL,
          logo_url TEXT,
          primary_color TEXT,
          secondary_color TEXT,
          support_email TEXT,
          support_phone TEXT,
          company_document TEXT,
          gateway_token TEXT,
          clicksign_token TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          updated_by TEXT,
          CONSTRAINT tenant_settings_pkey PRIMARY KEY (id)
        );
      ', schema_name);



      -- adjustment_rates
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.adjustment_rates (
          id TEXT NOT NULL,
          index_id TEXT NOT NULL,
          competence TEXT NOT NULL,
          accumulated_rate DECIMAL(65,30) NOT NULL,
          CONSTRAINT adjustment_rates_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      EXECUTE format('
        CREATE UNIQUE INDEX IF NOT EXISTS adjustment_rates_index_id_competence_key ON %I.adjustment_rates(index_id, competence);
      ', schema_name);

      -- contract_adjustments
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.contract_adjustments (
          id TEXT NOT NULL,
          contract_id TEXT NOT NULL,
          previous_value DECIMAL(65,30) NOT NULL,
          new_value DECIMAL(65,30) NOT NULL,
          applied_rate DECIMAL(65,30) NOT NULL,
          type TEXT NOT NULL,
          reason TEXT,
          applied_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          applied_by TEXT,
          CONSTRAINT contract_adjustments_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      -- document_templates
      EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.document_templates (
          id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          path TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          updated_by TEXT,
          CONSTRAINT document_templates_pkey PRIMARY KEY (id)
        );
      ', schema_name);

      -- Add missing columns to existing tables
      EXECUTE format('ALTER TABLE %I.customers ADD COLUMN IF NOT EXISTS delinquency_score INTEGER NOT NULL DEFAULT 1000;', schema_name);
      EXECUTE format('ALTER TABLE %I.contacts ADD COLUMN IF NOT EXISTS cpf TEXT;', schema_name);
      EXECUTE format('ALTER TABLE %I.contacts ADD COLUMN IF NOT EXISTS password_hash TEXT;', schema_name);
      EXECUTE format('ALTER TABLE %I.contacts ADD COLUMN IF NOT EXISTS portal_access BOOLEAN NOT NULL DEFAULT false;', schema_name);
      EXECUTE format('ALTER TABLE %I.contracts ADD COLUMN IF NOT EXISTS adjustment_index_id TEXT;', schema_name);
      EXECUTE format('ALTER TABLE %I.contracts ADD COLUMN IF NOT EXISTS next_adjustment_date TIMESTAMP(3);', schema_name);

    END IF;

    RAISE NOTICE 'Done updating schema: %', schema_name;
  END LOOP;
END $$;
