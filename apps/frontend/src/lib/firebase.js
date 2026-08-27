import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Esta configuración es pública por diseño (así funciona Firebase en el
// cliente: la seguridad real la dan las reglas del proyecto y el Admin SDK
// del backend, no el secreto de estas variables). Aun así viven en .env
// para no hardcodear valores distintos entre ambientes (dev/prod).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUDGET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENSSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)

// Único uso de Firebase en todo el frontend: autenticación.
// Ningún dato de perfil/rol se guarda ni se lee de Firebase.
export const auth = getAuth(firebaseApp)
