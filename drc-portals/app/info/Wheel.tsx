'use client'
import CFDEWheel from 'cfde-wheel';
import usePathname from '@/utils/pathname';

export default function Wheel() {
  const pathname = usePathname()
  if (pathname === "/info") return null
  return <CFDEWheel/>;
}

