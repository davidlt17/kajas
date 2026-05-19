# Kajas 📦✨

**Kajas** es una aplicación web full-stack diseñada para la gestión inteligente de almacenamiento mediante códigos QR. Permite organizar pertenencias en ubicaciones físicas, cajas virtuales y objetos individuales, facilitando la localización de cualquier ítem mediante el escaneo de un código QR único pegado en la caja física.

## 🌟 Características Principales

-   **Autenticación Segura**: Registro e inicio de sesión protegidos con JWT (JSON Web Tokens).
-   **Aislamiento de Datos Estricto**: Cada usuario solo puede ver y gestionar sus propios lugares, cajas y objetos.
-   **Gestión de Almacenamiento Premium**:
    -   **Ubicaciones**: Define espacios físicos (Trastero, Garaje, Oficina).
    -   **Cajas**: Crea cajas vinculadas a una ubicación con IDs únicos y obtén feedback visual (Confeti) al crearlas.
    -   **Objetos**: Registra qué hay dentro (nombre, cantidad, foto), asigna un **valor económico**, clasifícalos por **categorías**, y muévelos entre cajas con facilidad.
-   **Dashboard Analítico y Actividad**:
    -   Visualiza el **valor total asegurado** de tu inventario.
    -   Gráficos circulares interactivos con la distribución de tus objetos.
    -   **Historial de Actividad**: Trazabilidad completa de tus últimos movimientos en un elegante *timeline*.
-   **Buscador Global (Omnisearch)**: Encuentra instantáneamente cualquier caja, lugar u objeto buscando por nombre o categoría desde un modal flotante accesible globalmente.
-   **Exportación Profesional**: Genera y descarga al instante reportes en **PDF** del inventario de cualquier caja.
-   **Sistema QR Inteligente**: Generación, descarga y escaneo integrados (con cámara del dispositivo) para acceder a las cajas.
-   **Diseño Moderno**: Interfaz minimalista con soporte completo para **Dark Mode** (con selector dinámico Sol/Luna) y animaciones fluidas (Mobile-First).

## 🛠️ Stack Tecnológico

-   **Frontend**: React.js + Vite, Tailwind CSS, Lucide React (iconos), `qrcode.react`.
-   **Backend**: Node.js + Express, JWT, Bcrypt (seguridad), `pg` (PostgreSQL driver).
-   **Base de Datos**: PostgreSQL 15.
-   **Infraestructura**: Docker & Docker Compose para orquestación completa.

## 📂 Arquitectura del Proyecto

El proyecto sigue una arquitectura **MVC (Modelo-Vista-Controlador)** limpia:

-   `backend/controllers/`: Lógica de negocio y consultas a la base de datos aisladas por usuario.
-   `backend/routes/`: Definición de endpoints de la API REST.
-   `backend/middlewares/`: Protección de rutas con JWT y manejo centralizado de errores.
-   `frontend/src/components/`: Componentes modulares y vistas reactivas.

## 🚀 Guía de Inicio Rápido

### Requisitos previos
-   Tener instalado **Docker** y **Docker Compose**.

### Instalación y Ejecución

1.  Clona el repositorio o sitúate en la raíz del proyecto.
2.  Levanta los contenedores con Docker Compose:
    ```bash
    docker compose up -d --build
    ```
3.  Acceso a las aplicaciones:
    -   **Frontend**: [http://localhost:5180](http://localhost:5180)
    -   **Backend (API)**: [http://localhost:3080/api](http://localhost:3080/api)
    -   **Base de Datos**: Puerto `5480` en localhost.

### Usuarios de Prueba
Puedes registrarte directamente desde la interfaz de la aplicación para empezar a crear tus propios almacenes protegidos.

## 🚀 API Endpoints

Todos los endpoints (excepto los de autenticación) requieren el encabezado `Authorization: Bearer <token_jwt>`.

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/register` | Registra un nuevo usuario. |
| `POST` | `/login` | Inicia sesión y devuelve el token JWT y datos del usuario. |

### Ubicaciones (`/api/locations`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Obtiene todas las ubicaciones del usuario. |
| `POST` | `/` | Crea una nueva ubicación. |

### Cajas (`/api/boxes`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Lista todas las cajas del usuario. |
| `GET` | `/:id` | Obtiene detalle de una caja (por ID o QR_ID) e incluye sus objetos. |
| `POST` | `/` | Crea una nueva caja vinculada al usuario. |

### Objetos (`/api/items`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Lista todos los objetos del usuario. |
| `POST` | `/` | Crea un nuevo objeto dentro de una caja. |
| `PUT` | `/:id` | Actualiza la información de un objeto. |
| `DELETE` | `/:id` | Elimina un objeto de forma permanente. |

## 📝 Base de Datos (Esquema)
El sistema utiliza UUIDs para todos los identificadores, garantizando seguridad y escalabilidad:
-   `users`: Usuarios registrados.
-   `locations`: Lugares físicos vinculados a un usuario.
-   `boxes`: Cajas vinculadas a una ubicación y a un usuario.
-   `items`: Objetos dentro de las cajas, vinculados a un usuario.

## 🔄 Historial de Actualizaciones y Mejoras

En las últimas iteraciones se han introducido las siguientes correcciones y características premium:

1. **Gestión de Imágenes por Archivos (Volumen Docker)**:
   - Corregido el error de carga útil de red `413 Payload Too Large`. Las imágenes subidas (portadas y fotos de objetos) ya no se almacenan como texto Base64 pesado directamente en la base de datos.
   - Ahora, el backend procesa las imágenes Base64, las almacena físicamente en el volumen Docker (`/uploads/`) y guarda únicamente la ruta del archivo.
2. **Mejoras en el Asistente de Creación y Edición**:
   - **Lugares (Ubicaciones)**: Añadido soporte para capturar foto mediante la cámara del dispositivo o subir un archivo local como portada, unificando la experiencia con el resto de formularios.
   - **Edición y Eliminación de Cajas**: Añadido un menú contextual de tres puntos en la vista de detalle de la caja (`/boxes/:id`) con soporte completo para eliminar la caja o modificar sus datos y portada.
3. **Comentarios en Objetos**:
   - Posibilidad de añadir comentarios personalizados a cada objeto en el inventario al crearlos o actualizarlos.
4. **Contadores Dinámicos de Inventario**:
   - Corregido el conteo estático de `4 objetos` en las tarjetas de las cajas del home y del catálogo. Ahora se calcula dinámicamente sumando la cantidad real de todos los ítems de cada caja a través del backend (`SUM(cantidad)`).
5. **Estabilidad de Desarrollo**:
   - Activado el modo Legacy Watch (`-L`) de nodemon para que los cambios en archivos locales se sincronicen al instante dentro del entorno virtualizado Docker en sistemas Windows.

---
**Desarrollado con un enfoque en la simplicidad y el diseño moderno.**
