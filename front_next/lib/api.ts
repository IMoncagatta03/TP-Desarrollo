export const BACKEND_PORT = '8080';
export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:${BACKEND_PORT}`;
    }
    return `http://localhost:${BACKEND_PORT}`;
};

export const API_ROUTES = {
    HUESPEDES: '/api/huespedes',
    HABITACIONES_ESTADO: '/habitaciones/estado',
};
