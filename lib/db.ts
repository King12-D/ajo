import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
  
  return globalForPrisma.prisma
}

export const prisma = getPrisma()
