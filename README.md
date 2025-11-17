# 🎓 API Cursos- Sistema de Gestión Educativa

Sistema completo de gestión educativa con API REST en Node.js/Express y frontend en React + Vite.

## 📋 Descripción

Aplicación full-stack para gestionar usuarios (alumnos y docentes), cursos e inscripciones. Incluye autenticación JWT, validaciones robustas y documentación interactiva.

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Node.js** v16 o superior
- **npm** o **yarn**
- **MongoDB** (local o MongoDB Atlas)
- **Git**

---

## 🖥️ Backend (API REST)

### Terminal 1 - Backend

#### Paso 1: Navegar a la carpeta del backend

```bash
cd backend-escolar
```

#### Paso 2: Instalar dependencias

```bash
npm install
```

#### Paso 3: Configurar variables de entorno

Crear un archivo `.env` en la raíz de `backend-escolar/`:

```bash
# Linux/Mac
touch .env

# Windows (cmd)
type nul > .env

# Windows (PowerShell)
New-Item .env -ItemType File
```

Editar el archivo `.env` y agregar:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/escolar
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
```

**Si usas MongoDB Atlas:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/escolar?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
```

#### Paso 4: Iniciar el servidor

**Modo desarrollo (con auto-reload):**

```bash
npm run dev
```

**Modo producción:**

```bash
npm start
```

#### Verificación

Deberías ver en consola:

```
Morgan activo (modo de desarrollo)
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:5000
```

Prueba el health check:

```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "ts": "2025-11-14T..."
}
```

---

## 🌐 Frontend (React + Vite)

### Terminal 2 - Frontend

#### Paso 1: Navegar a la carpeta del frontend

```bash
cd front-escolar
```

#### Paso 2: Instalar dependencias

```bash
npm install
```

#### Paso 3: Configurar variables de entorno (opcional)

Si tu backend corre en otro puerto/host, crear `.env` en `front-escolar/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Por defecto, el frontend se conecta a `http://localhost:5000/api`.

#### Paso 4: Iniciar el servidor de desarrollo

```bash
npm run dev
```

#### Verificación

Deberías ver:

```
VITE v7.1.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Abre tu navegador en **http://localhost:5173**

---

## 📁 Estructura del Proyecto

```
api-escolar/
├── backend-escolar/          # API REST con Express
│   ├── controllers/          # Lógica de negocio
│   ├── models/               # Esquemas de MongoDB (Mongoose)
│   ├── routes/               # Definición de rutas
│   ├── middlewares/          # Auth, validaciones
│   ├── docs/                 # Documentación adicional
│   ├── index.js              # Punto de entrada
│   ├── package.json
│   └── .env                  # Variables de entorno (crear)
│
└── front-escolar/            # Aplicación React + Vite
    ├── src/
    │   ├── views/            # Páginas (Clases, Usuarios, etc.)
    │   ├── components/       # Componentes reutilizables
    │   ├── context/          # Context API (AuthContext)
    │   ├── services/         # Cliente Axios (api.js)
    │   └── main.jsx          # Entry point
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Scripts Disponibles

### Backend

```bash
npm start       # Iniciar servidor en producción
npm run dev     # Iniciar con nodemon (auto-reload)
```

### Frontend

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build para producción
npm run preview # Preview del build
npm run lint    # Linter
```

---

## 📚 Endpoints de la API

### Autenticación

```
POST   /api/usuarios           # Registro de usuario
POST   /api/usuarios/auth      # Login (devuelve JWT)
```

### Usuarios (requieren JWT)

```
GET    /api/usuarios           # Listar usuarios
GET    /api/usuarios/:id       # Detalle de usuario
PUT    /api/usuarios/:id       # Actualizar usuario
DELETE /api/usuarios/:id       # Eliminar usuario
```

### Cursos (GET públicos, POST/PUT/DELETE requieren JWT)

```
GET    /api/cursos             # Listar cursos
GET    /api/cursos/:id         # Detalle de curso
POST   /api/cursos             # Crear curso (JWT)
PUT    /api/cursos/:id         # Actualizar curso (JWT)
DELETE /api/cursos/:id         # Eliminar curso (JWT)
```

### Inscripciones

```
GET    /api/inscripciones      # Listar inscripciones
POST   /api/inscripciones      # Inscribirse (JWT)
```

### Health Check

```
GET    /api/health             # Estado del servidor
```

**Autenticación JWT:**

Para endpoints protegidos, incluir el header:

```
Authorization: Bearer <token>
```

---

## 🛠️ Solución de Problemas

### ❌ Error: "Cannot connect to MongoDB"

**Problema:** El backend no puede conectarse a la base de datos.

**Soluciones:**

1. **MongoDB local no está corriendo:**

   ```bash
   # Linux/Mac
   sudo systemctl start mongodb
   # o
   brew services start mongodb-community

   # Windows (abrir terminal como administrador)
   net start MongoDB
   ```

2. **Verificar conexión a MongoDB:**

   ```bash
   mongosh
   # o si tienes versión antigua
   mongo
   ```

3. **MongoDB Atlas - Verificar credenciales:**

   - IP Whitelist: Agregar tu IP en MongoDB Atlas → Network Access
   - Verificar usuario y password en la URI
   - Formato correcto: `mongodb+srv://usuario:password@cluster.mongodb.net/escolar`

4. **Revisar archivo `.env`:**
   - Debe estar en la raíz de `backend-escolar/`
   - Variable `MONGODB_URI` sin espacios ni comillas extras

---

### ❌ Error de CORS en el frontend

**Problema:** El navegador bloquea las peticiones con error CORS.

**Síntomas:**

```
Access to XMLHttpRequest at 'http://localhost:5000/api/usuarios'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Soluciones:**

1. **Verificar configuración CORS en backend:**

   Abrir `backend-escolar/index.js` y verificar:

   ```javascript
   const cors = require("cors");
   app.use(
     cors({
       origin: "http://localhost:5173", // URL del frontend
     })
   );
   ```

2. **Si el frontend corre en otro puerto:**

   Actualizar el `origin` en el backend con el puerto correcto.

3. **Permitir múltiples orígenes (desarrollo + producción):**

   ```javascript
   app.use(
     cors({
       origin: [
         "http://localhost:5173",
         "http://localhost:3000",
         "https://tu-dominio.com",
       ],
     })
   );
   ```

4. **Reiniciar el servidor backend** después de cambiar la configuración.

---

### ❌ Error: "Module not found" o dependencias faltantes

**Problema:** Faltan paquetes npm.

**Solución:**

```bash
# Backend
cd backend-escolar
rm -rf node_modules package-lock.json
npm install

# Frontend
cd front-escolar
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Error: "Port 5000 already in use"

**Problema:** El puerto ya está ocupado por otro proceso.

**Soluciones:**

1. **Cambiar el puerto en el backend:**

   Editar `.env`:

   ```env
   PORT=5001
   ```

   Y actualizar en el frontend (si usas `.env`):

   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

2. **Matar el proceso en el puerto:**

   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9

   # Windows (cmd como administrador)
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

---

### ❌ Error: "Cannot find module '.env'"

**Problema:** Falta el paquete `dotenv` o el archivo `.env`.

**Solución:**

```bash
cd backend-escolar
npm install dotenv
```

Crear el archivo `.env` como se indica en la sección de instalación.

---

### ❌ Frontend muestra "Network Error" o "ERR_CONNECTION_REFUSED"

**Problema:** El backend no está corriendo o la URL es incorrecta.

**Soluciones:**

1. **Verificar que el backend esté corriendo:**

   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Revisar la URL base del frontend:**

   Abrir `front-escolar/src/services/api.js`:

   ```javascript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
   });
   ```

3. **Verificar variables de entorno del frontend:**
   - Si tienes `.env`, debe empezar con `VITE_`
   - Reiniciar el servidor de desarrollo después de cambiar `.env`

---

### ❌ Error: "JWT malformed" o "Unauthorized"

**Problema:** Token JWT inválido o expirado.

**Solución:**

1. Cerrar sesión y volver a iniciar sesión
2. Limpiar localStorage:
   ```javascript
   // En la consola del navegador (F12)
   localStorage.clear();
   location.reload();
   ```
3. Verificar que el backend tenga configurado `JWT_SECRET` en `.env`

---

### ❌ Validaciones no funcionan (classCode, email, etc.)

**Problema:** El backend acepta datos inválidos.

**Solución:**

1. **Verificar que las rutas usen validaciones:**

   En `backend/routes/cursos.routes.js` debe haber:

   ```javascript
   const { validationResult } = require("express-validator");
   const { validarCampos } = require("../middlewares/validation");
   ```

2. **Revisar los validadores en las rutas:**

   ```javascript
   router.post(
     "/",
     [
       check("nombre", "Nombre requerido").notEmpty(),
       check("classCode", "classCode debe estar entre 1 y 15")
         .isInt({ min: 1, max: 15 })
         .toInt(),
       validarCampos,
     ],
     crearClase
   );
   ```

---

### ❌ MongoDB Atlas: "Bad auth" o "Authentication failed"

**Problema:** Credenciales incorrectas en MongoDB Atlas.

**Soluciones:**

1. **Verificar usuario y contraseña:**

   - Ir a MongoDB Atlas → Database Access
   - Verificar que el usuario existe y tiene permisos de lectura/escritura

2. **Caracteres especiales en la contraseña:**

   Si tu password tiene caracteres especiales (`@`, `#`, etc.), codifícalos:

   - `@` → `%40`
   - `#` → `%23`
   - etc.

   Ejemplo:

   ```
   mongodb+srv://usuario:pass%40word@cluster.mongodb.net/escolar
   ```

3. **Verificar el nombre de la base de datos:**
   - La URI termina con `/escolar` (o el nombre que uses)
   - Agregar `?retryWrites=true&w=majority`

---

### 📞 Soporte Adicional

Si los problemas persisten:

1. Revisar logs del backend en la terminal
2. Abrir la consola del navegador (F12) para ver errores del frontend
3. Verificar la documentación de la API en `/docs` (frontend)

---

## 👨‍💻 Autores

**Mateo Ciccarello, Jeremias Ramirez Calvo, Felix Castelino**
Materia: Aplicaciones Híbridas
Docente: Jonathan Emanuel Cruz
Comisión: DWM4AP

---

## 📄 Licencia

Este proyecto es de uso educativo.
