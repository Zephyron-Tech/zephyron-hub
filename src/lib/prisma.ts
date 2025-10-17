import { PrismaClient } from '@prisma/client';

// Zabráníme vytváření nových instancí PrismaClient v developmentu při hot-reloadu
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}