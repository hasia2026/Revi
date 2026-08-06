export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          industry: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          country: string | null;
          logo_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          industry?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          logo_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          industry?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string | null;
          logo_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name_en: string;
          name_es: string | null;
          description_en: string | null;
          description_es: string | null;
          price_type: string;
          price: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name_en: string;
          name_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          price_type?: string;
          price?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name_en?: string;
          name_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          price_type?: string;
          price?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          service_id: string | null;
          full_name: string;
          phone: string | null;
          email: string | null;
          preferred_language: string;
          source: string;
          status: string;
          service_address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          preferred_date: string | null;
          notes: string | null;
          last_contact_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          service_id?: string | null;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          preferred_language?: string;
          source?: string;
          status?: string;
          service_address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          preferred_date?: string | null;
          notes?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          service_id?: string | null;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          preferred_language?: string;
          source?: string;
          status?: string;
          service_address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          preferred_date?: string | null;
          notes?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          lead_id: string | null;
          subject: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          lead_id?: string | null;
          subject?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          lead_id?: string | null;
          subject?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      training_courses: {
        Row: {
          id: string;
          business_id: string;
          title_en: string;
          title_es: string | null;
          description_en: string | null;
          description_es: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title_en: string;
          title_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title_en?: string;
          title_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_lessons: {
        Row: {
          id: string;
          business_id: string;
          course_id: string;
          title_en: string;
          title_es: string | null;
          description_en: string | null;
          description_es: string | null;
          lesson_type: string;
          video_url: string | null;
          document_url: string | null;
          content_en: string | null;
          content_es: string | null;
          duration_minutes: number | null;
          display_order: number;
          required: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          course_id: string;
          title_en: string;
          title_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          lesson_type?: string;
          video_url?: string | null;
          document_url?: string | null;
          content_en?: string | null;
          content_es?: string | null;
          duration_minutes?: number | null;
          display_order?: number;
          required?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          course_id?: string;
          title_en?: string;
          title_es?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          lesson_type?: string;
          video_url?: string | null;
          document_url?: string | null;
          content_en?: string | null;
          content_es?: string | null;
          duration_minutes?: number | null;
          display_order?: number;
          required?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_training_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          course_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          course_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          lesson_id: string;
          question: string;
          options: Json;
          correct_answer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          question: string;
          options: Json;
          correct_answer: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          question?: string;
          options?: Json;
          correct_answer?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          answers: Json;
          score: number | null;
          passed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          answers: Json;
          score?: number | null;
          passed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          answers?: Json;
          score?: number | null;
          passed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      knowledge_categories: {
        Row: {
          id: string;
          business_id: string;
          name_en: string;
          name_es: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name_en: string;
          name_es?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name_en?: string;
          name_es?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      knowledge_articles: {
        Row: {
          id: string;
          category_id: string | null;
          business_id: string;
          question_en: string;
          question_es: string | null;
          answer_en: string;
          answer_es: string | null;
          status: string;
          used_by_revi: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          business_id: string;
          question_en: string;
          question_es?: string | null;
          answer_en: string;
          answer_es?: string | null;
          status?: string;
          used_by_revi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          business_id?: string;
          question_en?: string;
          question_es?: string | null;
          answer_en?: string;
          answer_es?: string | null;
          status?: string;
          used_by_revi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          id: string;
          business_id: string;
          site_title_en: string | null;
          site_title_es: string | null;
          tagline_en: string | null;
          tagline_es: string | null;
          about_en: string | null;
          about_es: string | null;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          logo_url: string | null;
          hero_image_url: string | null;
          show_services: boolean;
          show_about: boolean;
          show_faq: boolean;
          show_quote_form: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          site_title_en?: string | null;
          site_title_es?: string | null;
          tagline_en?: string | null;
          tagline_es?: string | null;
          about_en?: string | null;
          about_es?: string | null;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          logo_url?: string | null;
          hero_image_url?: string | null;
          show_services?: boolean;
          show_about?: boolean;
          show_faq?: boolean;
          show_quote_form?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          site_title_en?: string | null;
          site_title_es?: string | null;
          tagline_en?: string | null;
          tagline_es?: string | null;
          about_en?: string | null;
          about_es?: string | null;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          logo_url?: string | null;
          hero_image_url?: string | null;
          show_services?: boolean;
          show_about?: boolean;
          show_faq?: boolean;
          show_quote_form?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          id: string;
          business_id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          business_id: string;
          uploader_id: string;
          name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          uploader_id: string;
          name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          uploader_id?: string;
          name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessMember = Database["public"]["Tables"]["business_members"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type TrainingCourse = Database["public"]["Tables"]["training_courses"]["Row"];
export type TrainingLesson = Database["public"]["Tables"]["training_lessons"]["Row"];
export type EmployeeTrainingProgress = Database["public"]["Tables"]["employee_training_progress"]["Row"];
export type QuizQuestion = Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
export type KnowledgeCategory = Database["public"]["Tables"]["knowledge_categories"]["Row"];
export type KnowledgeArticle = Database["public"]["Tables"]["knowledge_articles"]["Row"];
export type WebsiteSettings = Database["public"]["Tables"]["website_settings"]["Row"];
export type BusinessSettings = Database["public"]["Tables"]["business_settings"]["Row"];
export type DBFile = Database["public"]["Tables"]["files"]["Row"];
