export interface UserData {
  supabase_uid: string;
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
}

export interface CheckAuthResponse {
  message: string;
  user?: {
    // ✅ User is optional in case of errors
    id: string;
    email: string;
    full_name?: string;
    location?: string[]; // ✅ Add location (matches backend)
  };
  expires_in?: number; // ✅ Include token expiry time
}
