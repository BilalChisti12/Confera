// If deployed on Vercel, it uses REACT_APP_BACKEND_URL. Otherwise, defaults to localhost for development.
const server = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8000`;

export default server;