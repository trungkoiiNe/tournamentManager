import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type User = {
  uid: string;
  email: string;
  role: 'admin' | 'coach' | 'player' | 'organizer';
};

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    try {
      const lowercaseEmail = email.toLowerCase();
      const userCredential = await auth().signInWithEmailAndPassword(lowercaseEmail, password);
      const { uid } = userCredential.user;
      const userDoc = await firestore().collection('TournamentManager').doc(lowercaseEmail).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        set({ user: { uid, email: lowercaseEmail, role: userData?.role } });
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, password, role) => {
    try {
      const lowercaseEmail = email.toLowerCase();
      const userCredential = await auth().createUserWithEmailAndPassword(lowercaseEmail, password);
      const { uid } = userCredential.user;
      await firestore().collection('TournamentManager').doc(lowercaseEmail).set({ role });
      set({ user: { uid, email: lowercaseEmail, role: role as 'admin' | 'coach' | 'player' | 'organizer' } });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await auth().signOut();
      set({ user: null });
      console.log(user);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
}));
