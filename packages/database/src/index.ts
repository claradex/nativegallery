import { PrismaClient } from '@prisma/client';

export { Prisma } from '@prisma/client';

export const database = new PrismaClient();
