export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          birth_date: string | null;
          phone: string | null;
          email: string | null;
          contact_method: string | null;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          birth_date?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_method?: string | null;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          birth_date?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_method?: string | null;
          comment?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          session_date: string;
          session_time: string;
          duration: number;
          status: string;
          session_type: string;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          session_date: string;
          session_time: string;
          duration?: number;
          status?: string;
          session_type?: string;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          session_date?: string;
          session_time?: string;
          duration?: number;
          status?: string;
          session_type?: string;
          comment?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          session_id: string | null;
          amount: number;
          currency: string;
          payment_date: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          session_id?: string | null;
          amount: number;
          currency?: string;
          payment_date: string;
          comment?: string;
          created_at?: string;
        };
        Update: {
          amount?: number;
          currency?: string;
          payment_date?: string;
          comment?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
    };
  };
}
