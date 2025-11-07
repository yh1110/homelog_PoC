export interface UserProfile {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileInput {
  terms_accepted?: boolean;
  terms_accepted_at?: string;
}
