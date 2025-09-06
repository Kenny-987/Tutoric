import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

type User = any;

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setLoggedIn: (value: boolean) => void;
  clearUser: () => void;
  loadUserFromStorage: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user }),
  setLoggedIn: (value: boolean) => set({ isLoggedIn: value }),
  clearUser: () => {
    SecureStore.deleteItemAsync('token');
    set({ user: null, isLoggedIn: false });
  },
  loadUserFromStorage: async () => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      try {
        set({ isLoggedIn: true });
        const response = await axios.get('http://10.182.90.139:3000/user/data',{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if(response.status === 200|| response.status === 201) {
          set({ user: response.data });
        }
      } catch (error) {
        console.log(error);
        
      }
    
    }
  },
}));
