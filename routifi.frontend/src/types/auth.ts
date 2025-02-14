export interface UserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  location?: string;
}

export interface LoginResponse {
  user: UserData;
  access_token: string;
  refresh_token: string;
}

export interface VerifyTokenResponse {
  message: string;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}
