
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (role?: 'host' | 'viewer') => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // If they somehow logged in but don't have a doc, we'll create a default viewer one
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=6366f1&color=fff`,
              points: 0,
              tier: 'Bronze',
              isVerified: false,
              role: 'viewer'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              createdAt: serverTimestamp()
            });
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (role: 'host' | 'viewer' = 'viewer') => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=${role === 'host' ? '000' : '6366f1'}&color=fff`,
          points: role === 'host' ? 125000 : 2450,
          tier: role === 'host' ? 'Platinum' : 'Gold',
          isVerified: true,
          role: role
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          createdAt: serverTimestamp()
        });
        setUser(newUser);
      } else {
        setUser(userDoc.data() as User);
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
