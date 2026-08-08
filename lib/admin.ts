export const ADMIN_EMAILS = ['kiritpa@zeta.tech']

export function isAppAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}
