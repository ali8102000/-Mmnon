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
      chats: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          provider_id: string
          request_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          provider_id: string
          request_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          provider_id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          available: boolean
          completed_rides: number
          rating_avg: number
          ratings_count: number
          updated_at: string
          user_id: string
          vehicle_category:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
        }
        Insert: {
          available?: boolean
          completed_rides?: number
          rating_avg?: number
          ratings_count?: number
          updated_at?: string
          user_id: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Update: {
          available?: boolean
          completed_rides?: number
          rating_avg?: number
          ratings_count?: number
          updated_at?: string
          user_id?: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      driver_wallets: {
        Row: {
          balance: number
          currency: string
          total_commission: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          currency?: string
          total_commission?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          currency?: string
          total_commission?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_locations: {
        Row: {
          heading: number | null
          lat: number
          lng: number
          request_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          heading?: number | null
          lat: number
          lng: number
          request_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          heading?: number | null
          lat?: number
          lng?: number
          request_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_locations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean
          base_fare: number
          commission_pct: number
          currency: string
          id: string
          minimum_fare: number
          per_km: number
          per_min: number
          updated_at: string
          vehicle_category: string
        }
        Insert: {
          active?: boolean
          base_fare?: number
          commission_pct?: number
          currency?: string
          id?: string
          minimum_fare?: number
          per_km?: number
          per_min?: number
          updated_at?: string
          vehicle_category: string
        }
        Update: {
          active?: boolean
          base_fare?: number
          commission_pct?: number
          currency?: string
          id?: string
          minimum_fare?: number
          per_km?: number
          per_min?: number
          updated_at?: string
          vehicle_category?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          ratee_id: string
          rater_id: string
          request_id: string
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id: string
          rater_id: string
          request_id: string
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id?: string
          rater_id?: string
          request_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_offers: {
        Row: {
          distance_km: number | null
          expires_at: string
          id: string
          provider_id: string
          request_id: string
          responded_at: string | null
          sent_at: string
          status: string
        }
        Insert: {
          distance_km?: number | null
          expires_at?: string
          id?: string
          provider_id: string
          request_id: string
          responded_at?: string | null
          sent_at?: string
          status?: string
        }
        Update: {
          distance_km?: number | null
          expires_at?: string
          id?: string
          provider_id?: string
          request_id?: string
          responded_at?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          accepted_at: string | null
          admin_notes: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          commission: number | null
          completed_at: string | null
          created_at: string
          customer_id: string
          customer_price: number | null
          dest_lat: number | null
          dest_lng: number | null
          dest_text: string | null
          distance_km: number | null
          duration_min: number | null
          fare_breakdown: Json | null
          id: string
          level_required: Database["public"]["Enums"]["worker_level"] | null
          notes: string | null
          payment_method: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_text: string
          price_estimate: number | null
          pricing_mode: string | null
          provider_id: string | null
          searching_started_at: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          type: Database["public"]["Enums"]["request_type"]
          updated_at: string
          vehicle_category:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          work_description: string | null
          work_hours: number | null
          workers_count: number
        }
        Insert: {
          accepted_at?: string | null
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          commission?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          customer_price?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          dest_text?: string | null
          distance_km?: number | null
          duration_min?: number | null
          fare_breakdown?: Json | null
          id?: string
          level_required?: Database["public"]["Enums"]["worker_level"] | null
          notes?: string | null
          payment_method?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_text?: string
          price_estimate?: number | null
          pricing_mode?: string | null
          provider_id?: string | null
          searching_started_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          type: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          work_description?: string | null
          work_hours?: number | null
          workers_count?: number
        }
        Update: {
          accepted_at?: string | null
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          commission?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          customer_price?: number | null
          dest_lat?: number | null
          dest_lng?: number | null
          dest_text?: string | null
          distance_km?: number | null
          duration_min?: number | null
          fare_breakdown?: Json | null
          id?: string
          level_required?: Database["public"]["Enums"]["worker_level"] | null
          notes?: string | null
          payment_method?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_text?: string
          price_estimate?: number | null
          pricing_mode?: string | null
          provider_id?: string | null
          searching_started_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
          work_description?: string | null
          work_hours?: number | null
          workers_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          icon: string
          id: string
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string
          id?: string
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          currency: string
          id: string
          note: string | null
          request_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          request_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          request_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          base_fare: number
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at: string
          id: string
          make: string
          min_year: number
          model: string
          per_km: number
        }
        Insert: {
          base_fare?: number
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          id?: string
          make: string
          min_year?: number
          model: string
          per_km?: number
        }
        Update: {
          base_fare?: number
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          id?: string
          make?: string
          min_year?: number
          model?: string
          per_km?: number
        }
        Relationships: []
      }
      worker_profiles: {
        Row: {
          available: boolean
          bio: string | null
          completed_jobs: number
          level: Database["public"]["Enums"]["worker_level"]
          rating_avg: number
          ratings_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean
          bio?: string | null
          completed_jobs?: number
          level?: Database["public"]["Enums"]["worker_level"]
          rating_avg?: number
          ratings_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean
          bio?: string | null
          completed_jobs?: number
          level?: Database["public"]["Enums"]["worker_level"]
          rating_avg?: number
          ratings_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_services: {
        Row: {
          service_id: string
          worker_id: string
        }
        Insert: {
          service_id: string
          worker_id: string
        }
        Update: {
          service_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      driver_public_stats: {
        Row: {
          available: boolean | null
          rating_avg: number | null
          ratings_count: number | null
          user_id: string | null
          vehicle_category:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Insert: {
          available?: boolean | null
          rating_avg?: number | null
          ratings_count?: number | null
          user_id?: string | null
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Update: {
          available?: boolean | null
          rating_avg?: number | null
          ratings_count?: number | null
          user_id?: string | null
          vehicle_category?:
            | Database["public"]["Enums"]["vehicle_category"]
            | null
        }
        Relationships: []
      }
      worker_public_stats: {
        Row: {
          available: boolean | null
          level: Database["public"]["Enums"]["worker_level"] | null
          rating_avg: number | null
          ratings_count: number | null
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          level?: Database["public"]["Enums"]["worker_level"] | null
          rating_avg?: number | null
          ratings_count?: number | null
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          level?: Database["public"]["Enums"]["worker_level"] | null
          rating_avg?: number | null
          ratings_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_service_request: {
        Args: { _request_id: string }
        Returns: boolean
      }
      cancel_service_request: {
        Args: { _reason: string; _request_id: string }
        Returns: string
      }
      dispatch_request: { Args: { _request_id: string }; Returns: number }
      find_nearby_drivers: {
        Args: {
          _category: string
          _lat: number
          _limit?: number
          _lng: number
          _radius_km?: number
        }
        Returns: {
          distance_km: number
          rating_avg: number
          user_id: string
        }[]
      }
      find_nearby_provider_pins: {
        Args: {
          _category?: string
          _lat: number
          _limit?: number
          _lng: number
          _radius_km?: number
          _service_id?: string
          _type: string
        }
        Returns: {
          heading: number
          lat: number
          lng: number
          pin_id: string
        }[]
      }
      grant_provider_role_safe: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_pending_offer: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_request_customer: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
      lookup_email_by_phone: { Args: { _phone: string }; Returns: string }
      transition_service_request: {
        Args: {
          _reason?: string
          _request_id: string
          _status: Database["public"]["Enums"]["request_status"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "driver" | "worker" | "admin"
      request_status:
        | "pending"
        | "searching"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      request_type: "taxi" | "service"
      vehicle_category: "economy" | "premium" | "luxury"
      worker_level: "fani" | "khabir"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "driver", "worker", "admin"],
      request_status: [
        "pending",
        "searching",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      request_type: ["taxi", "service"],
      vehicle_category: ["economy", "premium", "luxury"],
      worker_level: ["fani", "khabir"],
    },
  },
} as const
