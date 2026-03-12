import { prisma } from '../prisma';
export const getLeads = () => prisma.lead.findMany();
