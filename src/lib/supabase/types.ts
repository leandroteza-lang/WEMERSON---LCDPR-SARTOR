// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          tax_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tax_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tax_id?: string | null
        }
        Relationships: []
      }
      lcdpr_files: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          producer_id: string
          status: string
          year: number
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          producer_id: string
          status?: string
          year: number
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          producer_id?: string
          status?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "lcdpr_files_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          tax_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          tax_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          tax_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: companies
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   tax_id: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: lcdpr_files
//   id: uuid (not null, default: gen_random_uuid())
//   producer_id: uuid (not null)
//   year: integer (not null)
//   status: text (not null, default: 'draft'::text)
//   content: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: producers
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (not null)
//   name: text (not null)
//   tax_id: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   company_id: uuid (nullable)
//   full_name: text (nullable)
//   role: text (nullable, default: 'viewer'::text)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: companies
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
//   UNIQUE companies_tax_id_key: UNIQUE (tax_id)
// Table: lcdpr_files
//   PRIMARY KEY lcdpr_files_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lcdpr_files_producer_id_fkey: FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE
// Table: producers
//   FOREIGN KEY producers_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY producers_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: companies
//   Policy "Users can access their company" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid())))
//     WITH CHECK: (id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid())))
// Table: lcdpr_files
//   Policy "Users can access their files" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (producer_id IN ( SELECT producers.id    FROM producers   WHERE (producers.company_id IN ( SELECT profiles.company_id            FROM profiles           WHERE (profiles.id = auth.uid())))))
//     WITH CHECK: (producer_id IN ( SELECT producers.id    FROM producers   WHERE (producers.company_id IN ( SELECT profiles.company_id            FROM profiles           WHERE (profiles.id = auth.uid())))))
// Table: producers
//   Policy "Users can access their producers" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid())))
//     WITH CHECK: (company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid())))
// Table: profiles
//   Policy "Users can insert own profile" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (id = auth.uid())
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())

// --- INDEXES ---
// Table: companies
//   CREATE UNIQUE INDEX companies_tax_id_key ON public.companies USING btree (tax_id)

