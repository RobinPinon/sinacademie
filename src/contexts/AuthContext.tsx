import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Vérification du statut admin pour l\'utilisateur:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')  // Sélectionner toutes les colonnes pour voir toutes les données
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        throw error;
      }
      
      console.log('Données complètes de l\'utilisateur:', data);
      console.log('Valeur de is_admin:', data?.is_admin);
      setIsAdmin(data?.is_admin || false);
      console.log('Statut admin mis à jour:', data?.is_admin || false);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session récupérée:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('ID de l\'utilisateur:', session.user.id);
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Changement d\'état d\'authentification:', _event);
      console.log('Nouvelle session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('ID de l\'utilisateur (changement):', session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Veuillez confirmer votre email avant de vous connecter');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('Erreur lors de la connexion');
    }

    // Vérifier le statut admin après la connexion
    await checkAdminStatus(data.user.id);
  };

  const register = async (email: string, password: string) => {
    // Validation basique
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email: email,
        },
        emailRedirectTo: `${window.location.origin}/profile`
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Cet email est déjà utilisé');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Limite d\'envoi d\'emails atteinte. Veuillez réessayer dans quelques minutes ou contactez l\'administrateur.');
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('Erreur lors de la création du compte');
    }

    // Connexion automatique après l'inscription
    await login(email, password);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 