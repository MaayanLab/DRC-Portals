'use client';
import React from 'react';
import { CartProvider } from '../c2m2_summary/CartContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
