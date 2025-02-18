export interface UserData {
  email: string;
  password: string;
  full_name?: string;
  date_of_birth?: string;
  location?: string;
}

export interface LoginResponse {
  user: {
    supabase_uid: string;
    full_name: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface VerifyTokenResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
}
