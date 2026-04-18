export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
export const UPLOADS_URL = `${API_URL}/uploads`;
export const IMAGES_URL = `${API_URL}/img`;
