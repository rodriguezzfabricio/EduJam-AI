"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  registerWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  signInWithGoogle, 
  resetPassword, 
  logout, 
  onAuthChange 
} from "./auth";
import { User as FirebaseUser } from "firebase/auth";

// Define user type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  signOut: async () => {}
});

// Helper function to convert Firebase user to our user type
const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(formatUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign in method
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginWithEmailAndPassword(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up method
  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const result = await registerWithEmailAndPassword(email, password, name || email.split('@')[0]);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const handleSignInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (email: string) => {
    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle: handleSignInWithGoogle,
        resetPassword: handleResetPassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
} 