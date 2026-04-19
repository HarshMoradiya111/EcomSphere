export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getToken(): string | null {
  const cookieToken = getCookie('token');
  if (cookieToken) return cookieToken;
  
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}
