import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { provider } from './firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false); // Unblock the UI immediately
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        onSnapshot(docRef, (snap) => {
          if (snap.exists()) setData(snap.data());
        }, (err) => {
          console.error("Firestore snapshot error:", err);
        });
      } else {
        setData(null);
      }
    });
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const syncData = async (newData) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), newData, { merge: true });
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-primary font-bold">Loading Application...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, data, login, logout, syncData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
