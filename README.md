# Educational Research · UNAD (518024)

Página del curso. El estudiante escribe su número de documento y recibe **únicamente**
su enlace de carpeta y su propio estado de avance. Los datos de los demás nunca salen
del servidor.

---

## 1. Cómo lee los datos la app

La app **nunca abre un `.xlsx`**. Eso pasa una sola vez, en tu computador, cuando corres
el importador:

```
Carpetas - 2026-2 (Educational Research).xlsx
            │
            │  npm run import          ← en tu PC
            ▼
   data/students.json  +  .env.value
            │
            │  npm run publish         ← sube el valor a Vercel
            ▼
   STUDENTS_JSON (variable de entorno)
            │
            ▼
      lib/students.ts  →  Map en memoria  →  /api/lookup
```

En producción la app lee **la variable de entorno**; `data/students.json` es solo el
respaldo para desarrollo local. El dataset se carga una vez por instancia y se reutiliza.

### Forma del JSON

Los nombres de los ítems viven **una sola vez**, no repetidos en cada estudiante (eso
bajó el archivo de 57 KB a 15 KB, y Vercel solo admite 64 KB de variables de entorno):

```jsonc
{
  "phases": [
    { "phase": "Carpeta Administrativa", "items": ["ARL", "Cover letter"] },
    { "phase": "Fase 2", "items": ["Work plan", "Attendance 12 hours phase 2", "..."] }
  ],
  "students": [
    {
      "id": "1234567890",
      "name": "Estudiante de Prueba",
      "email": "...",
      "url": "https://...",
      "group": "00",
      "comments": "",
      "marks": ["x", "x", "", "/", "Reenviar en PDF", "..."]  // una por ítem, en orden
    }
  ]
}
```

---

## 2. Cómo llenar el Excel

El importador busca las columnas **por el nombre de su encabezado**, así que puedes
reordenarlas, agregar ítems nuevos o renombrarlos sin tocar código.

### Columnas que reconoce

| Columna | Acepta también | Para qué |
|---|---|---|
| `Cédula` | Documento, Identificación, CC | La llave de búsqueda |
| `Estudiante` | Nombre | Se muestra en el resultado |
| `Correo` | Email | Cruce entre archivos |
| `Folder` | Carpeta, Link, Enlace | El enlace privado |
| `Group` | Grupo, CIPAS | Se muestra como etiqueta |
| `Comments` | Comentarios, Observaciones | **El estudiante lo lee** como nota del tutor |

**Cualquier otra columna con encabezado se vuelve un ítem de seguimiento.** La fila de
arriba de los encabezados (la banda combinada: `Carpeta Administrativa`, `Fase 2`, …)
define el grupo; cada ítem hereda la etiqueta que tenga a su izquierda.

### Qué escribir en las casillas

| Escribes | El estudiante ve |
|---|---|
| *(vacío)*, `.`, `-`, `*` | ○ Pendiente |
| `x`, `X`, `✓`, `ok`, `sí`, `listo`, `1` | ● **Cumplido** (cuenta en la barra de avance) |
| `n/a`, `na`, `no aplica` | ⊖ No aplica (no cuenta para el total) |
| Cualquier otro texto | ● El texto tal cual, como observación |

Ese último caso es el útil: si escribes `Reenviar en PDF` en una casilla, al estudiante
le aparece esa frase junto al ítem.

> Los símbolos `.` `-` `*` se tratan como casilla vacía a propósito, porque sirven de
> relleno visual para que los links no se desborden sobre la columna siguiente.

### Agrégale la columna `Cédula`

Hoy el archivo de seguimiento no tiene cédulas, así que el importador las saca de
`carpetas.xlsx` cruzando por correo (verificado: los 45 correos y los 45 links coinciden
exactamente entre los dos archivos).

**En cuanto le agregues una columna `Cédula`, `carpetas.xlsx` deja de hacer falta** y
todo queda en un solo archivo. El importador lo detecta solo y te lo avisa en consola.

---

## 3. Actualizar y publicar

Cuando cambies el Excel:

```bash
npm run publish
```

Eso relee el Excel, reemplaza `STUDENTS_JSON` en Vercel y despliega. Si solo quieres
regenerar los datos para probar en local:

```bash
npm run import
```

El importador avisa en consola si una fila queda por fuera (sin cédula, sin link válido
o con cédula repetida) y cuánto del presupuesto de 64 KB llevas usado.

---

## 4. Publicar anuncios

Edita [content/announcements.ts](content/announcements.ts) y agrega un objeto **al
principio** de la lista:

```ts
{
  date: "2026-09-22",
  title: "Entrega de la Fase 3",
  body: "Recuerden subir el documento en PDF antes del domingo a medianoche.",
  link: { label: "Ver la rúbrica", href: "https://..." },
}
```

`link` es opcional. Todo lo que pongas ahí es **público**: lo ve cualquiera que abra la
página. Los enlaces privados nunca van aquí.

---

## 5. Confidencialidad

```
Navegador                          Servidor (Vercel)
─────────                          ─────────────────
escribe 1234567890
        │  POST /api/lookup  { "id": "1234567890" }
        ├────────────────────────────────►  busca en STUDENTS_JSON
        │                                   (45 registros, en memoria)
        │  { name, url, group, comments, phases, done, total }
        ◄────────────────────────────────┤  SOLO ese registro — 1.2 KB de 15 KB
   muestra 1 link
```

| Medida | Dónde |
|---|---|
| `import "server-only"`: el build **falla** si los datos se importan desde un componente de cliente | [lib/students.ts](lib/students.ts) |
| La respuesta trae un solo registro, y **sin cédula ni correo** | [app/api/lookup/route.ts](app/api/lookup/route.ts) |
| `POST`, no `GET`: el documento no queda en la URL, ni en el historial, ni en los logs | [app/folder-lookup.tsx](app/folder-lookup.tsx) |
| `Cache-Control: no-store`: ni el navegador ni el CDN guardan la respuesta | [app/api/lookup/route.ts](app/api/lookup/route.ts) |
| Límite de 20 intentos por IP cada 10 minutos | [lib/rate-limit.ts](lib/rate-limit.ts) |
| Piso de latencia de 400 ms: acierto y fallo tardan lo mismo | [app/api/lookup/route.ts](app/api/lookup/route.ts) |
| Nunca se escribe el documento consultado en los logs | [app/api/lookup/route.ts](app/api/lookup/route.ts) |
| **Todos** los `.xlsx`, los `.env` y `data/` están en `.gitignore` | [.gitignore](.gitignore) |

Verificado sobre el build de producción: de los 26 archivos que el navegador puede
descargar, **ninguno** contiene un link, una cédula ni un correo.

### Los tres límites reales

1. **La cédula identifica, no autentica.** Quien conozca el documento de un compañero
   puede ver su enlace y su avance. El límite por IP frena el barrido automático, pero no
   una consulta puntual. Para cerrarlo del todo habría que pedir algo que solo el
   estudiante sepa (un código enviado a su correo institucional).
2. **Los enlaces de SharePoint son la última línea de defensa.** Si están compartidos
   como *"cualquier persona con el vínculo"*, un estudiante puede reenviar el suyo.
   Compártelos como **"Personas específicas"** y el enlace deja de servirle a nadie más.
3. **El límite por IP es best-effort.** Vercel levanta varias instancias serverless y cada
   una tiene su propia memoria. Para un límite estricto haría falta Upstash Redis.

---

## 6. Primer despliegue

```bash
npx vercel login
```

```bash
npx vercel link
```

```bash
npm run publish
```

### Con GitHub (recomendado, para ir publicando anuncios con `git push`)

```bash
git init && git add -A && git commit -m "Página del curso Educational Research"
```

El `.gitignore` excluye todos los Excel, `data/students.json` y los `.env`, así que
**nada confidencial entra al repositorio**. Conéctalo en vercel.com y cada `git push`
despliega solo. Los datos siguen viajando por `STUDENTS_JSON`, aparte del código.

---

## 7. Desarrollo local

```bash
npm run dev
```

En http://localhost:3000, usando `.env.local` (lo genera `npm run import`), así que se
comporta igual que producción.

```bash
npm run build
```

---

## Estructura

```
app/
  page.tsx              Página principal (servidor)
  layout.tsx            Metadatos, noindex
  folder-lookup.tsx     Formulario y checklist (cliente) — solo habla con la API
  globals.css           Estilos, modo claro y oscuro
  api/lookup/route.ts   La búsqueda. Único punto que toca los datos
lib/
  students.ts           Carga, decodifica las marcas y consulta — server-only
  rate-limit.ts         Límite por IP
content/
  announcements.ts      Anuncios del curso  ← edita esto para publicar
scripts/
  import-excel.mjs      Excel → data/students.json (sin dependencias)
  publish.mjs           import + variable en Vercel + deploy
data/
  students.json         Generado. Ignorado por git.
```
