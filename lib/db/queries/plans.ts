import { prisma } from '../prisma';
export const getPlans = () => prisma.plan.findMany();
