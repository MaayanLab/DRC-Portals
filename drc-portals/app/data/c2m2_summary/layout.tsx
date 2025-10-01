'use client';
import React from 'react';
import { CartProvider } from './CartContext'; // local import

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
