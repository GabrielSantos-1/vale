import { prisma } from '../prisma';
export const getFaq = () => prisma.fAQ.findMany();
