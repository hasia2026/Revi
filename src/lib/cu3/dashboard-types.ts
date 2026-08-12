/**
 * Defined locally rather than in src/types/database.ts, same reasoning
 * as CompanyCompass in lib/supabase/compass.ts: keeps new tables
 * decoupled from that file's churn, which has been the actual source
 * of every schema-drift bug this session (Alpha bug #1, the app-wide
 * fix before it). If database.ts is ever regenerated from the live
 * schema, these can be pointed at that instead.
 */

export type PrioritySource = "user" | "cue";
export type PriorityStatus = "open" | "complete";

export type Priority = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  source: PrioritySource;
  status: PriorityStatus;
  pinned: boolean;
  assigned_to: string | null;
  due_date: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  business_id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  read: boolean;
  created_at: string;
};
