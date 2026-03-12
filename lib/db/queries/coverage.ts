import { prisma } from '../prisma';
export const getCoverageAreas = () => prisma.coverageArea.findMany();
