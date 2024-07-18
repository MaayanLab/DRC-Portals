import { Prisma } from "@prisma/client"

/**
 * Like Prisma.join -- but filters out Prisma.empty, and supports empty/singular lists
 */
export function Prisma_join<T>(L: T[], sep: string) {
  L = L.filter(el => el !== Prisma.empty)
  return L.length === 0 ? Prisma.empty : L.length === 1 ? L[0] : Prisma.join(L, sep)
}
