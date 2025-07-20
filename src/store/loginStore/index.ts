import { create } from "zustand";

interface LoginPageStoreInterface {
  userInfo: any;
  setUserInfo: (data: any) => void;
}
export const useLoginPageStore = create<LoginPageStoreInterface>((set) => ({
  userInfo: null,
  setUserInfo: (data: any) => {
    set({ userInfo: data });
  },
}));
