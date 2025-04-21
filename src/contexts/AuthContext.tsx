import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isMaintainer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isMaintainer, setIsMaintainer] = useState(false);

  // Fonction pour vérifier le statut de l'utilisateur
  const checkUserStatus = async (userId: string) => {
    try {
      // Utiliser une requête SQL directe via une fonction RPC
      const { data, error } = await supabase.rpc('get_user_status', {
        user_id: userId
      });

      if (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        setIsAdmin(false);
        setIsApproved(false);
        setIsMaintainer(false);
        return;
      }

      if (!data) {
        // Si pas de données, créer un nouvel utilisateur
        const { error: insertError } = await supabase
          .from('users')
          .upsert([
            { 
              id: userId,
              email: user?.email,
              is_admin: false,
              is_approved: false,
              is_maintainer: false,
              created_at: new Date().toISOString()
            }
          ], {
            onConflict: 'id'
          });

        if (insertError) {
          console.error('Erreur lors de la création/mise à jour du profil:', insertError);
        }
        
        setIsAdmin(false);
        setIsApproved(false);
        setIsMaintainer(false);
        return;
      }

      console.log('Statut utilisateur mis à jour:', data);
      setIsAdmin(!!data.is_admin);
      setIsApproved(!!data.is_approved);
      setIsMaintainer(!!data.is_maintainer);
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
      setIsAdmin(false);
      setIsApproved(false);
      setIsMaintainer(false);
    }
  };

  // Fonction pour rafraîchir le statut de l'utilisateur
  const refreshUserStatus = async () => {
    if (user?.id) {
      await checkUserStatus(user.id);
    }
  };

  // Effet pour gérer l'authentification
  useEffect(() => {
    // Vérifier la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserStatus(session.user.id);
      }
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setIsApproved(false);
        setIsMaintainer(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data');

      await checkUserStatus(data.user.id);
    } catch (error: any) {
      let message = 'Erreur lors de la connexion';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou mot de passe incorrect';
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      let message = 'Erreur lors de l\'inscription';
      if (error.message.includes('already registered')) {
        message = 'Cet email est déjà utilisé';
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAdmin(false);
      setIsApproved(false);
      setIsMaintainer(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isApproved,
    isMaintainer,
    login,
    register,
    logout,
    refreshUserStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 