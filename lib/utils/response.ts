export function success(data: any) {
  return { success: true, data };
}
export function failure(error: string) {
  return { success: false, error };
}
