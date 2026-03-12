// Use require() to avoid TypeScript resolution issues with generated Prisma client in bootstrap
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client')

declare global {
  // allow global `var` in development to avoid multiple instances
  // eslint-disable-next-line no-var
  var prisma: any
}

const client = global.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') global.prisma = client

export const prisma = client
export default prisma
