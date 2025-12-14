// const API_URL = process.env.VITE_APP_API_URL || 'http://localhost:5000';
// // Then use `${API_URL}/api/auth/register`
// export {API_URL};
// const API_URL = import.meta.env.VITE_APP_API_URL ;
// export { API_URL };

// config.js
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
export { API_URL };