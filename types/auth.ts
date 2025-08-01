  export interface LoginParams {
    email: string;
    password: string;
  }

  export interface AuthStore {
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (params: LoginParams) => Promise<void>;
  }