'use client';

import React, { createContext, useContext, useState } from 'react';

export interface SavedBarChart {
  id: string;
  chartType: 'bar';
  xAxis: string;
  yAxis: string;
  groupBy: string;
  chartData: Record<string, any>[];
  plotDescription: string;
  showUnspecified: boolean;
}

export interface SavedPieChart {
  id: string;
  chartType: 'pie';
  xAxis: string;         // e.g., "anatomy"
  xAxisValue: string;    // e.g., "brain"
  groupBy: string;       // e.g., "disease"
  pieData: { name: string; value: number }[];    // The data in the modal
  pieDescription: string;                        // LLM or user-provided
  parentBarChartId?: string;                     // Optional: to relate to parent bar chart
}

export type SavedChart = SavedBarChart | SavedPieChart;

interface CartContextType {
  cart: SavedChart[];
  addToCart: (item: SavedChart) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<SavedChart[]>([]);

  const addToCart = (item: SavedChart) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(chart => chart.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
