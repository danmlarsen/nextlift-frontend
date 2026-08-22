import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import Logo from "@/components/logo";
import { Spinner } from "@/components/ui/spinner";
import { API_URL } from "@/lib/constants";

const SESSION_FLAG = "hasSession";

export interface AuthResult {
  success: boolean;
  statusCode?: number;
  code?: string;
  message?: string;
}

export interface AuthContextType {
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  loginWithCredentials: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  loginWithCaptcha: (token: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  confirmEmail: (token: string) => Promise<AuthResult>;
  resendEmailConfirmation: (email: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  // De-duplicate concurrent refreshes: many 401s at once share one request.
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const login = (token: string) => {
    setAccessToken(token);
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          message: parsedResponse?.message || "Login failed",
          code: parsedResponse?.code,
        };
      }

      const { access_token: accessToken } = await res.json();
      setAccessToken(accessToken);
      localStorage.setItem(SESSION_FLAG, "1");

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const loginWithCaptcha = async (captchaToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/demo/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ captchaToken }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          message: parsedResponse?.message || "Failed to start demo session",
          code: parsedResponse?.code,
        };
      }

      const { access_token: accessToken } = await res.json();
      setAccessToken(accessToken);
      localStorage.setItem(SESSION_FLAG, "1");

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const register = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message: parsedResponse?.message || "Registration failed",
        };
      }

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResult> => {
    if (!accessToken) {
      return {
        success: false,
        message: "You must be signed in to change your password.",
      };
    }

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message: parsedResponse?.message || "Unable to change password",
        };
      }

      return await res.json();
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const confirmEmail = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/confirm/${token}`);

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message: parsedResponse?.message || "Unable to confirm email",
        };
      }

      return await res.json();
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const resendEmailConfirmation = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message:
            parsedResponse?.message || "Unable to resend confirmation email",
        };
      }

      return await res.json();
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message:
            parsedResponse?.message || "Unable to request password reset",
        };
      }

      return await res.json();
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/password-reset/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const parsedResponse = await res.json();
        return {
          success: false,
          statusCode: parsedResponse?.statusCode,
          message: parsedResponse?.message || "Unable to reset password",
        };
      }

      return await res.json();
    } catch {
      return {
        success: false,
        message: "Network error. Please try again later.",
      };
    }
  };

  const logout = async () => {
    if (accessToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });
      } catch (error) {
        console.warn("Logout request failed:", error);
      }
    }

    setAccessToken(null);
    localStorage.removeItem(SESSION_FLAG);
    queryClient.clear();
  };

  const refresh = async (): Promise<string | null> => {
    // If a refresh is already in flight, reuse it instead of firing another.
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const doRefresh = async (): Promise<string | null> => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const { access_token: newAccessToken } = (await res.json()) as {
            access_token: string;
          };
          setAccessToken(newAccessToken);
          return newAccessToken;
        }

        setAccessToken(null);
        localStorage.removeItem(SESSION_FLAG);
        return null;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    };

    const promise = doRefresh();
    refreshPromiseRef.current = promise;
    try {
      return await promise;
    } finally {
      refreshPromiseRef.current = null;
    }
  };

  useEffect(() => {
    if (localStorage.getItem(SESSION_FLAG)) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto grid min-h-dvh px-4">
        <div className="flex justify-center py-10">
          <Logo />
        </div>
        <div className="fixed inset-0 grid place-items-center">
          <Spinner className="size-16" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isLoggedIn: !!accessToken,
        isLoading,
        login,
        loginWithCredentials,
        loginWithCaptcha,
        register,
        changePassword,
        confirmEmail,
        resendEmailConfirmation,
        requestPasswordReset,
        resetPassword,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
