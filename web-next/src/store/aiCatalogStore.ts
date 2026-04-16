import { create } from 'zustand';

interface AIProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  countInStock?: number;
  tempImage: string;
}

interface AICatalogState {
  pendingProducts: AIProduct[];
  categories: string[];
  setPendingProducts: (products: AIProduct[]) => void;
  setCategories: (categories: string[]) => void;
  clear: () => void;
}

export const useAICatalogStore = create<AICatalogState>((set) => ({
  pendingProducts: [],
  categories: [],
  setPendingProducts: (products) => set({ pendingProducts: products }),
  setCategories: (categories) => set({ categories }),
  clear: () => set({ pendingProducts: [], categories: [] }),
}));
