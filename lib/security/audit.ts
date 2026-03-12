export function auditLogPlaceholder(entry: { actor?: string; action: string; entity?: string; entityId?: string; metadata?: any }) {
  // Implement persistent audit logging later
  // For now, write to console for development
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', JSON.stringify(entry))
  }
}

export default auditLogPlaceholder
export function logAudit(action: string, metadata?: any) {
  // TODO: send to AuditLog via prisma
}
