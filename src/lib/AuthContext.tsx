"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "./api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        setAccessToken(storedToken);
        await fetchCurrentUser(storedToken);
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", // ← Include cookies
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", token);
        setAccessToken(token);
        setUser(data.user);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
    }
  };

  const login = async (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    
    // Set token in cookie via API route
    try {
      await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error("Error setting token cookie:", error);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear refresh token
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      
      // Clear auth cookie
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const refreshUser = async () => {
    if (accessToken) {
      await fetchCurrentUser(accessToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};