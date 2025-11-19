import { create } from 'zustand';

type PageState = {
  pages: any[];
  getByPath: (path: string) => any | undefined;
  // Placeholder state - to be replaced with actual implementation
};

export const usePagesStore = create<PageState>((set, get) => ({
  pages: [],
  getByPath: (path: string) => {
    return get().pages.find((p) => p.path === path);
  },
}));
