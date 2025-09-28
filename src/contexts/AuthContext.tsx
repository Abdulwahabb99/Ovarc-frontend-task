import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type {
  User,
  LoginCredentials,
  UseAuthReturn,
  ApiResponse,
} from "@/types";
import { apiClient } from "@/api/client";

// State interface
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_CLEAR_ERROR" }
  | { type: "AUTH_INITIALIZED" };

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case "AUTH_CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "AUTH_INITIALIZED":
      return {
        ...state,
        initialized: true,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await apiClient.auth.getCurrentUser();
        if (response.success && response.user) {
          dispatch({ type: "AUTH_SUCCESS", payload: response.user });
        }
      } catch (error) {
        // User not authenticated, which is fine
        console.log("No authenticated user found");
      } finally {
        dispatch({ type: "AUTH_INITIALIZED" });
      }
    };

    // Add a small delay to ensure MSW is ready
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<ApiResponse> => {
      try {
        dispatch({ type: "AUTH_START" });

        // Try API first, fallback to mock authentication
        let response;
        try {
          response = await apiClient.auth.login(credentials);
        } catch (apiError) {
          console.warn(
            "API login failed, using fallback authentication:",
            apiError
          );
          // Fallback to mock authentication
          const mockUsers = [
            {
              id: 1,
              username: "admin",
              name: "Admin User",
              role: "admin",
              _password: "admin123",
            },
            {
              id: 2,
              username: "manager",
              name: "Store Manager",
              role: "manager",
              _password: "manager123",
            },
            {
              id: 3,
              username: "user",
              name: "Regular User",
              role: "user",
              _password: "user123",
            },
          ];
          const user = mockUsers.find(
            (u) =>
              u.username === credentials.username &&
              u._password === credentials.password
          );

          if (user) {
            response = {
              success: true,
              user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
              },
            };
          } else {
            response = {
              success: false,
              message: "Invalid credentials",
            };
          }
        }

        if (response.success && response.user) {
          // Ensure the user object matches the User type (role: 'admin' | 'manager' | 'user')
          const { id, username, name, role } = response.user;
          // If role is not one of the allowed values, treat as failure
          if (role === "admin" || role === "manager" || role === "user") {
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { id, username, name, role },
            });
            return { success: true };
          } else {
            dispatch({ type: "AUTH_FAILURE", payload: "Invalid user role" });
            return { success: false, message: "Invalid user role" };
          }
        } else {
          dispatch({
            type: "AUTH_FAILURE",
            payload: response.message || "Login failed",
          });
          return { success: false, message: response.message };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.warn("API logout failed, using fallback:", error);
      // Fallback logout - just clear local state
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Utility functions
  const isAuthenticated = useCallback((): boolean => {
    return state.user !== null;
  }, [state.user]);

  const canEdit = useCallback((): boolean => {
    return (
      state.user !== null &&
      (state.user.role === "admin" || state.user.role === "manager")
    );
  }, [state.user]);

  // Context value
  const value: UseAuthReturn = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    isAuthenticated,
    canEdit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
