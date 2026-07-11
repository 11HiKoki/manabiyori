export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MemoField = "work" | "private";
export type MemoType = "insight" | "learning" | "failure" | "lesson";
export type MemoVisibility = "private" | "friends" | "public";
export type ReflectionPeriodType = "week" | "month" | "year";

export type Database = {
  public: {
    Tables: {
      memos: {
        Row: {
          id: string;
          user_id: string;
          field: MemoField;
          types: MemoType[];
          title: string;
          event: string;
          insight: string;
          lesson: string;
          supportive_note: string;
          success_journal: string;
          strength_feedback: string;
          strength_feedback_person_id: string | null;
          next_action: string;
          next_action_done: boolean;
          hesitation: string;
          compared_options: string;
          rejected_reason: string;
          decision_criteria: string;
          ai_todo: string;
          dlab_reading: string;
          dlab_video: string;
          value_item: string;
          value_reflection: string;
          emotions: string[];
          occurred_at: string;
          visibility: MemoVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          field: MemoField;
          types: MemoType[];
          title: string;
          event?: string;
          insight?: string;
          lesson?: string;
          supportive_note?: string;
          success_journal?: string;
          strength_feedback?: string;
          strength_feedback_person_id?: string | null;
          next_action?: string;
          next_action_done?: boolean;
          hesitation?: string;
          compared_options?: string;
          rejected_reason?: string;
          decision_criteria?: string;
          ai_todo?: string;
          dlab_reading?: string;
          dlab_video?: string;
          value_item?: string;
          value_reflection?: string;
          emotions?: string[];
          occurred_at?: string;
          visibility?: MemoVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          field?: MemoField;
          types?: MemoType[];
          title?: string;
          event?: string;
          insight?: string;
          lesson?: string;
          supportive_note?: string;
          success_journal?: string;
          strength_feedback?: string;
          strength_feedback_person_id?: string | null;
          next_action?: string;
          next_action_done?: boolean;
          hesitation?: string;
          compared_options?: string;
          rejected_reason?: string;
          decision_criteria?: string;
          ai_todo?: string;
          dlab_reading?: string;
          dlab_video?: string;
          value_item?: string;
          value_reflection?: string;
          emotions?: string[];
          occurred_at?: string;
          visibility?: MemoVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memos_strength_feedback_person_id_fkey";
            columns: ["strength_feedback_person_id"];
            referencedRelation: "people";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      memo_tags: {
        Row: {
          memo_id: string;
          tag_id: string;
        };
        Insert: {
          memo_id: string;
          tag_id: string;
        };
        Update: {
          memo_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memo_tags_memo_id_fkey";
            columns: ["memo_id"];
            referencedRelation: "memos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memo_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      reflection_notes: {
        Row: {
          id: string;
          user_id: string;
          period_type: ReflectionPeriodType;
          period_start: string;
          period_end: string;
          summary: string;
          next_theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period_type: ReflectionPeriodType;
          period_start: string;
          period_end: string;
          summary?: string;
          next_theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period_type?: ReflectionPeriodType;
          period_start?: string;
          period_end?: string;
          summary?: string;
          next_theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reflection_notes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      people: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          nickname: string;
          relationship: string;
          met_at: string | null;
          met_place: string;
          hobbies: string;
          likes: string;
          favorite_points: string;
          strength_feedback: string;
          dislikes: string;
          values_note: string;
          next_topic: string;
          memo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          nickname?: string;
          relationship?: string;
          met_at?: string | null;
          met_place?: string;
          hobbies?: string;
          likes?: string;
          favorite_points?: string;
          strength_feedback?: string;
          dislikes?: string;
          values_note?: string;
          next_topic?: string;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          nickname?: string;
          relationship?: string;
          met_at?: string | null;
          met_place?: string;
          hobbies?: string;
          likes?: string;
          favorite_points?: string;
          strength_feedback?: string;
          dislikes?: string;
          values_note?: string;
          next_topic?: string;
          memo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "people_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      conversation_notes: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          talked_at: string;
          place: string;
          topics: string;
          impression: string;
          next_question: string;
          promise_note: string;
          follow_up: string;
          follow_up_done: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          talked_at?: string;
          place?: string;
          topics?: string;
          impression?: string;
          next_question?: string;
          promise_note?: string;
          follow_up?: string;
          follow_up_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          talked_at?: string;
          place?: string;
          topics?: string;
          impression?: string;
          next_question?: string;
          promise_note?: string;
          follow_up?: string;
          follow_up_done?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_notes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_notes_person_id_fkey";
            columns: ["person_id"];
            referencedRelation: "people";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      memo_field: MemoField;
      memo_type: MemoType;
      memo_visibility: MemoVisibility;
      reflection_period_type: ReflectionPeriodType;
    };
  };
};

export type MemoRow = Database["public"]["Tables"]["memos"]["Row"];
export type MemoInsert = Database["public"]["Tables"]["memos"]["Insert"];
export type MemoUpdate = Database["public"]["Tables"]["memos"]["Update"];

export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export type MemoTagRow = Database["public"]["Tables"]["memo_tags"]["Row"];
export type MemoTagInsert = Database["public"]["Tables"]["memo_tags"]["Insert"];
export type MemoTagUpdate = Database["public"]["Tables"]["memo_tags"]["Update"];

export type ReflectionNoteRow = Database["public"]["Tables"]["reflection_notes"]["Row"];
export type ReflectionNoteInsert = Database["public"]["Tables"]["reflection_notes"]["Insert"];
export type ReflectionNoteUpdate = Database["public"]["Tables"]["reflection_notes"]["Update"];

export type PersonRow = Database["public"]["Tables"]["people"]["Row"];
export type PersonInsert = Database["public"]["Tables"]["people"]["Insert"];
export type PersonUpdate = Database["public"]["Tables"]["people"]["Update"];

export type ConversationNoteRow = Database["public"]["Tables"]["conversation_notes"]["Row"];
export type ConversationNoteInsert = Database["public"]["Tables"]["conversation_notes"]["Insert"];
export type ConversationNoteUpdate = Database["public"]["Tables"]["conversation_notes"]["Update"];

export type MemoWithTags = MemoRow & {
  tags: TagRow[];
};

export type PersonWithConversationNotes = PersonRow & {
  conversation_notes: ConversationNoteRow[];
};

export const memoFieldLabels: Record<MemoField, "仕事" | "プライベート"> = {
  work: "仕事",
  private: "プライベート"
};

export const memoTypeLabels: Record<MemoType, "気づき" | "学び" | "失敗" | "教訓"> = {
  insight: "気づき",
  learning: "学び",
  failure: "失敗",
  lesson: "教訓"
};

export const reflectionPeriodLabels: Record<ReflectionPeriodType, "週" | "月" | "年"> = {
  week: "週",
  month: "月",
  year: "年"
};
