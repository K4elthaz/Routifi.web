export interface UserProfile {
  supabase_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
}
