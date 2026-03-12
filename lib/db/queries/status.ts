import { prisma } from '../prisma';
export const getNetworkStatus = () => prisma.networkStatus.findMany();
