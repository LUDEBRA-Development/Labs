# LUDEBRA Labs

**Laboratorio virtual para la enseñanza de circuitos electrónicos y electromagnetismo**, desarrollado para la Universidad Popular del Cesar. La plataforma combina simuladores interactivos, gestión académica (docentes, cursos, estudiantes) y seguimiento de actividades evaluativas en un solo aplicativo web.

> Repositorio: [github.com/LUDEBRA-Development/Labs](https://github.com/LUDEBRA-Development/Labs)

Este repositorio es una **reconstrucción desde cero** del proyecto original de LUDEBRA Labs (ver carpeta/tag histórico del proyecto antiguo), migrado a una arquitectura de **monorepo** con **Turborepo** y **pnpm**, bajo el flujo de trabajo **Gitflow**.

---

## Tabla de contenido

- [LUDEBRA Labs](#ludebra-labs)
  - [Tabla de contenido](#tabla-de-contenido)
  - [Visión general](#visión-general)
  - [Arquitectura del monorepo](#arquitectura-del-monorepo)
  - [Stack tecnológico](#stack-tecnológico)
  - [Módulos del sistema](#módulos-del-sistema)
    - [Módulo 1 — Gestión de Personas y Acceso](#módulo-1--gestión-de-personas-y-acceso)
    - [Módulo 2 — Cursos y Matrícula](#módulo-2--cursos-y-matrícula)
    - [Módulo 3 — Contenido y Actividades](#módulo-3--contenido-y-actividades)
    - [Módulo 4 — Evaluación y Seguimiento](#módulo-4--evaluación-y-seguimiento)
  - [Estructura de carpetas](#estructura-de-carpetas)
  - [Requisitos previos](#requisitos-previos)
  - [Puesta en marcha](#puesta-en-marcha)
    - [1. Clonar el repositorio](#1-clonar-el-repositorio)
    - [2. Instalar pnpm (si no lo tienes)](#2-instalar-pnpm-si-no-lo-tienes)
    - [3. Instalar dependencias](#3-instalar-dependencias)
    - [4. Variables de entorno](#4-variables-de-entorno)
    - [5. Levantar el proyecto en desarrollo](#5-levantar-el-proyecto-en-desarrollo)
    - [6. Compilar para producción](#6-compilar-para-producción)
    - [Instalar una dependencia dentro de una app o paquete](#instalar-una-dependencia-dentro-de-una-app-o-paquete)
  - [Scripts disponibles](#scripts-disponibles)
  - [Flujo de trabajo con Gitflow](#flujo-de-trabajo-con-gitflow)
  - [Convenciones de commits](#convenciones-de-commits)
  - [Reglas de contribución](#reglas-de-contribución)
  - [Roadmap](#roadmap)
  - [Documentación adicional](#documentación-adicional)
  - [Equipo](#equipo)
  - [Licencia](#licencia)

---

## Visión general

LUDEBRA Labs nace para resolver un problema puntual en la enseñanza de electromagnetismo y circuitos electrónicos: los estudiantes tienen dificultades para visualizar y aplicar de forma práctica conceptos teóricos por falta de herramientas interactivas. La plataforma ofrece:

- Un **catálogo de simuladores** electromagnéticos que cualquier usuario puede consultar.
- Un **flujo académico completo**: un administrador registra docentes, los docentes crean cursos y matriculan estudiantes, diseñan guías y actividades apoyadas en simuladores, y finalmente califican las entregas de sus estudiantes.
- Soporte para distintos tipos de usuario: **Administrador**, **Docente**, **Estudiante** y **Usuario externo** (este último solo con acceso al catálogo de simuladores).

El proyecto está pensado para **crecer**: nuevos simuladores, nuevos módulos académicos y nuevas integraciones deben poder añadirse sin reescribir lo existente. Por eso la reconstrucción se hace como monorepo modular en lugar de la aplicación monolítica original.

## Arquitectura del monorepo

```
Labs/
├── apps/
│   ├── backend/      # API REST — NestJS
│   └── frontend/     # SPA — React + Vite
├── packages/
│   ├── ui/                 # Librería de componentes compartidos
│   ├── eslint-config/      # Configuración de ESLint compartida
│   └── typescript-config/  # tsconfig base compartido
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

- **Turborepo** orquesta las tareas (`build`, `dev`, `lint`, `check-types`) entre todos los paquetes, cacheando resultados para acelerar CI y desarrollo local.
- **pnpm workspaces** administra las dependencias de `apps/*` y `packages/*` sin duplicarlas, y permite que el frontend y el backend compartan configuración (ESLint, TypeScript) desde `packages/`.
- Cada módulo funcional (ver [Módulos del sistema](#módulos-del-sistema)) vive como un dominio dentro de `apps/backend` (módulos de NestJS) y como un conjunto de rutas/vistas dentro de `apps/frontend`, de modo que se puedan extraer a paquetes o incluso a servicios independientes en el futuro sin romper el resto del sistema.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Monorepo / tooling | Turborepo, pnpm, ESLint, Prettier, TypeScript |
| Backend | NestJS 11, Node.js |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4 |
| Control de versiones | Git + Gitflow |
| Base de datos / ORM | MySQL + TypeORM |

> Este proyecto reemplaza el stack original (React + JavaScript sin monorepo, sin backend propio documentado) por una arquitectura tipada y modular pensada para escalar en equipo.

## Módulos del sistema

El sistema se organiza en módulos funcionales independientes que, en conjunto, cubren todo el ciclo de vida académico dentro de la plataforma.

### Módulo 1 — Gestión de Personas y Acceso
Administra **quién existe en el sistema y cómo entra**, separando el perfil (nombre, correo, rol, datos de contacto) de las credenciales de acceso.

- Registro y administración de usuarios (Administrador, Docente, Estudiante, Usuario externo).
- Autenticación y autorización basada en roles.
- Gestión de perfil: actualización de datos personales y cambio de contraseña.
- Validación de identidad y control del tipo de acceso según el rol.

### Módulo 2 — Cursos y Matrícula
Cubre la relación entre docentes, cursos y estudiantes: **al docente se le asigna el curso y se ingresan los estudiantes**.

- Creación y administración de cursos.
- Asignación de un docente responsable a cada curso.
- Matrícula (ingreso/gestión) de estudiantes dentro de un curso.

### Módulo 3 — Contenido y Actividades
El **docente crea guías y asigna actividades al curso**, incluyendo qué simulador habilita para cada una.

- Creación de guías de apoyo para las actividades.
- Diseño y asignación de actividades a un curso.
- Vinculación de cada actividad con el simulador del catálogo que debe usarse para resolverla.
- Catálogo de simuladores electromagnéticos, disponible también para usuarios externos.

### Módulo 4 — Evaluación y Seguimiento
El **ciclo completo de entrega y calificación** de actividades (equivalente a `User_tasks` en el proyecto original).

- Entrega de actividades por parte del estudiante (carga de documentos/resultados).
- Temporizador de actividades definido por el docente.
- Calificación de entregas por parte del docente.
- Seguimiento del progreso del estudiante dentro de cada curso.

> Estos cuatro módulos son el punto de partida. La arquitectura del monorepo está pensada para que módulos futuros (por ejemplo, reportería, notificaciones, nuevos simuladores o integraciones externas) se añadan como nuevos dominios dentro de `apps/backend` y nuevas rutas en `apps/frontend`, o incluso como paquetes/servicios independientes dentro de `apps/` o `packages/`.

## Estructura de carpetas

```
apps/backend/
└── src/
    ├── main.ts
    ├── app.module.ts
    └── <módulo>/           # un módulo de NestJS por dominio (personas-acceso, cursos, contenido, evaluacion, ...)

apps/frontend/
└── src/
    ├── assets/
    └── <módulo>/           # vistas y componentes por dominio, con sus propias rutas
```

A medida que se implemente cada módulo, se documentará aquí su ubicación exacta y sus principales endpoints/rutas.

## Requisitos previos

- [Node.js](https://nodejs.org/) `>= 18`
- [pnpm](https://pnpm.io/) `9.x` (gestor de paquetes del monorepo)
- Git

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/LUDEBRA-Development/Labs.git
cd Labs
```

### 2. Instalar pnpm (si no lo tienes)

El monorepo usa pnpm como gestor de paquetes obligatorio (no usar `npm install` ni `yarn install`, ya que romperían el `pnpm-lock.yaml` y los workspaces).

```bash
npm install -g pnpm@9
```

### 3. Instalar dependencias

Desde la **raíz** del repositorio, un solo comando instala las dependencias de `apps/*` y `packages/*` a la vez:

```bash
pnpm install
```

### 4. Variables de entorno

Cada app que las necesite tendrá su propio archivo de ejemplo (`.env.example`) dentro de `apps/backend` y/o `apps/frontend`. Cópialo y complétalo antes de levantar el proyecto:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Configura en el backend la conexión MySQL (`MYSQL_HOST`, `MYSQL_PORT`,
`MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`). El frontend usa
`VITE_API_URL` para localizar la API.

La base de datos utiliza un esquema previamente creado por el equipo. El
backend mantiene `synchronize: false` y no debe regenerar ni modificar sus
tablas automáticamente.

### 5. Levantar el proyecto en desarrollo

Para levantar **todo** el monorepo (backend + frontend en paralelo, orquestado por Turborepo):

```bash
pnpm dev
```

Para trabajar solo con una app puntual, usa los filtros de Turborepo:

```bash
pnpm turbo dev --filter=backend
pnpm turbo dev --filter=frontend
```

### 6. Compilar para producción

```bash
pnpm build
```

### Instalar una dependencia dentro de una app o paquete

Como es un workspace, **no** ejecutes `pnpm install` dentro de `apps/backend` o `apps/frontend`. Usa el flag `--filter` desde la raíz:

```bash
pnpm add <paquete> --filter backend
pnpm add <paquete> --filter frontend
pnpm add -D <paquete> --filter backend   # dependencia de desarrollo
```

Si la dependencia es compartida por todo el monorepo (herramientas de tooling, por ejemplo), instálala en la raíz:

```bash
pnpm add -D <paquete> -w
```

## Scripts disponibles

Definidos en el `package.json` raíz y ejecutados por Turborepo sobre todos los paquetes:

| Script | Descripción |
|---|---|
| `pnpm dev` | Levanta backend y frontend en modo desarrollo |
| `pnpm build` | Compila todas las apps y paquetes |
| `pnpm lint` | Ejecuta ESLint en todo el monorepo |
| `pnpm check-types` | Verifica los tipos de TypeScript en todo el monorepo |
| `pnpm format` | Formatea el código con Prettier |

## Flujo de trabajo con Gitflow

El repositorio sigue **Gitflow** para ordenar el desarrollo entre módulos y liberar versiones de forma controlada.

- **`main`** — código en producción / estable.
- **`develop`** — rama de integración; toda funcionalidad terminada llega aquí primero.
- **`feat/<descripcion>`** — una rama por funcionalidad, creada desde `develop` y fusionada de vuelta a `develop` vía Pull Request. Ejemplos ya usados en el proyecto:
  - `feat/configuracion-backend-nestjs`
  - `feat/configuracion-frontend-react-vite`
  - `feat/adicion-dependencias-router-tailwind-frontend`
  - `feat/correccion-package-nest`
- **`fix/<descripcion>`** — corrección de errores sobre `develop`.
- **`release/<version>`** — estabilización previa a publicar una nueva versión en `main`.
- **`hotfix/<descripcion>`** — corrección urgente directamente sobre `main`.

Flujo recomendado para una nueva tarea:

```bash
git checkout develop
git pull
git checkout -b feat/nombre-de-la-tarea
# ... trabajo y commits ...
git push -u origin feat/nombre-de-la-tarea
# Abrir Pull Request hacia develop
```

## Convenciones de commits

Se recomienda seguir [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial legible y facilitar el versionado automático a futuro:

```
feat: agregar módulo de matrícula de estudiantes
fix: corregir validación de credenciales en login
chore: configurar eslint compartido en packages
docs: actualizar README con módulo de evaluación
```

## Reglas de contribución

Cualquier persona del equipo puede contribuir al proyecto, siempre dentro del flujo de **Gitflow** descrito arriba. Estas son las reglas base:

1. **Nunca se hace push directo a `develop` ni a `main`.** Todo cambio entra a través de una rama (`feat/`, `fix/`, `release/`, `hotfix/`) y un Pull Request.
2. **Toda funcionalidad o corrección nace desde `develop`** (salvo un `hotfix`, que nace desde `main`) y se nombra siguiendo la convención `tipo/descripcion-corta-en-minusculas`, por ejemplo `feat/matricula-estudiantes` o `fix/validacion-login`.
3. **Abrir el Pull Request cuanto antes**, aunque esté en progreso (se puede marcar como *draft*), para que el resto del equipo tenga visibilidad de en qué se está trabajando y evitar choques entre ramas.
4. **El Pull Request debe describir claramente qué hace el cambio**: qué módulo toca, qué problema resuelve o qué funcionalidad agrega, y cómo probarlo.
5. **Solo el aprobador del repositorio (mantenedor del proyecto) revisa y aprueba/mergea los Pull Requests** hacia `develop` y `main`. El resto del equipo puede y debe:
   - Abrir sus propios PRs.
   - Revisar y comentar los PRs de sus compañeros (sugerencias, dudas, señalar errores).
   - Pero **no mergear** por su cuenta, ni siquiera si el PR ya tiene aprobaciones de otros compañeros.
6. **Antes de pedir revisión**, verifica localmente que el cambio pasa lint, tipado y build:
   ```bash
   pnpm lint
   pnpm check-types
   pnpm build
   ```
7. **Mantén tu rama actualizada con `develop`** antes de abrir o actualizar el PR, para reducir conflictos:
   ```bash
   git checkout feat/tu-rama
   git fetch origin
   git merge origin/develop
   ```
8. **Un PR, un propósito.** Evita mezclar en la misma rama cambios de módulos o temas distintos; eso facilita la revisión y el rollback si algo falla.
9. Las liberaciones a `main` (ramas `release/*`) y los `hotfix/*` los coordina el mantenedor del proyecto.

## Roadmap

- [x] Configuración base del monorepo (Turborepo + pnpm)
- [x] Scaffolding de backend (NestJS) y frontend (React + Vite + Tailwind)
- [ ] Módulo 1 — Gestión de Personas y Acceso
- [ ] Módulo 2 — Cursos y Matrícula
- [ ] Módulo 3 — Contenido y Actividades (incluye catálogo de simuladores)
- [ ] Módulo 4 — Evaluación y Seguimiento
- [x] Definición de base de datos / ORM (MySQL + TypeORM)
- [ ] Migración de simuladores del proyecto original
- [ ] CI/CD y despliegue

## Documentación adicional

- Documentación funcional original del proyecto (requerimientos, casos de uso, diagramas UML, mockups): ver documento de análisis y diseño de LUDEBRA Labs compartido por el equipo.
- Integración, API y validación pendiente del [Módulo 4 — Evaluación y Seguimiento](docs/modulo-4-evaluacion-seguimiento.md).
- Cada app (`apps/backend`, `apps/frontend`) mantiene su propio `README.md` con detalles específicos de configuración y ejecución.

## Equipo

Proyecto desarrollado por el equipo de **LUDEBRA Development** para la Facultad de Ingeniería y Tecnologías de la Universidad Popular del Cesar y con la colaboracion de los siguientes programadores:
@brisaac08
@Luis301311
@Moo0nchild
@wilemanjr

## Licencia

*Por definir.*
