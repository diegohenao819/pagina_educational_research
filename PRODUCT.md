# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes del curso Educational Research (código 518024) de la UNAD, Universidad Nacional Abierta y a Distancia (Colombia). Muchos entran desde el celular. Llegan con una tarea concreta: encontrar su carpeta personal de prácticas, ver su avance por fases y saber qué documentos subir.

Audiencia secundaria: el tutor del curso, que mantiene los datos y publica anuncios.

## Product Purpose

Una página del curso donde cada estudiante escribe su número de documento y recibe únicamente el enlace a su carpeta de SharePoint, junto con su avance por fases. La página también explica qué documento va en cada subcarpeta, enlaza los formatos oficiales y reúne los anuncios del tutor.

Éxito: el estudiante encuentra su carpeta sin escribirle al tutor, entiende qué le falta y sube los documentos correctos.

## Positioning

Un solo lugar, por estudiante, que junta su carpeta privada, su avance real y las reglas de cada documento. El campus virtual reparte esa información entre mensajes, foros y archivos.

## Operating Context

- El tutor mantiene un Excel de seguimiento (nombre, correo, carpeta, CIPAS y una columna por ítem) y lo publica con `npm run import` / `npm run publish`.
- Las fases del curso son: Documentos administrativos, Fase 2, Fase 3, Práctica simulada y Fase 5.
- Los formatos oficiales (asistencia F-7-6-12, diario de campo, plan de trabajo) viven en Google Drive; la carta de presentación se genera en SAI (e-Letter); la ARL tiene un comunicado.
- Antes de consultar su carpeta, el estudiante debe registrar su lugar de prácticas en un formulario de Google.
- Despliegue en Vercel.

## Capabilities and Constraints

- Búsqueda por cédula en una API del servidor: los enlaces, cédulas y correos nunca llegan al navegador. La respuesta trae un solo registro.
- Límite de intentos por IP y latencia mínima en la búsqueda.
- Los datos de estudiantes no se versionan (Excel, `.env`, `data/` en `.gitignore`). Ningún ejemplo, captura o documentación del repositorio puede contener datos reales de estudiantes.
- Estados de la búsqueda: normal, cargando, carpeta encontrada, documento no encontrado y error.
- Solo tema claro. No hay modo oscuro.
- Sin guiones largos (—) ni puntos medios (·) en los textos de la página.

## Brand Commitments

- Identidad UNAD: logo institucional (`public/logo-unad.png`) y el naranja institucional que ya usa la página, reservado para acciones principales, estados activos y pequeños acentos.
- Referentes de acabado elegidos por el tutor: Facebook y Google Classroom (interfaz clara, tarjetas blancas, acciones evidentes).
- Voz: español cercano y directo, en segunda persona (tú). Los nombres de los ítems del seguimiento vienen del Excel y pueden estar en inglés.

## Evidence on Hand

- Logo UNAD (PNG con transparencia, 427×302).
- Enlaces reales a los formatos y al formulario (en `content/`).
- No hay testimonios, métricas ni fotografías reales; no se deben inventar.

## Product Principles

1. La consulta de la carpeta es la tarea principal; todo lo demás la acompaña sin competir.
2. Privacidad primero: cada estudiante ve solo lo suyo.
3. Cada regla se explica donde se necesita, junto al documento al que aplica.
4. El avance debe entenderse de un vistazo y sin depender solo del color.

## Accessibility & Inclusion

Contraste suficiente en todo el texto, `focus-visible` claro, áreas táctiles cómodas en celulares de 360 a 430 px, estados comprensibles sin depender del color y respeto por `prefers-reduced-motion`.
