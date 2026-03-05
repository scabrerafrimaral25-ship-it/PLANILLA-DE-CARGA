# Gestor de Carga de Pallets

Aplicación web progresiva (PWA) para gestionar y organizar cargas de pallets por contenedor.

## Características Principales

- **Autoguardado**: Tus datos se guardan automáticamente en el navegador
- **Escáner de códigos**: Usa la cámara para escanear códigos de barras y QR
- **Soporte offline**: Funciona sin conexión a internet como PWA instalable
- **Modo oscuro**: Interfaz adaptable con tema claro/oscuro
- **Gráficos visuales**: Dashboard con visualización de datos en tiempo real
- **Contenedores colapsables**: Interfaz organizada tipo acordeón
- **Barra de progreso**: Seguimiento visual del progreso de escaneo
- **Notificaciones toast**: Feedback inmediato sin interrupciones
- **Exportación a Excel**: Genera planillas con formato profesional y resaltado
- **Impresión optimizada**: Diseño preparado para imprimir documentos de carga

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (opcional para Supabase):
   - Copiar `.env.example` a `.env.local`
   - Agregar credenciales de Supabase si deseas sincronización en la nube

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Build para producción

```bash
npm run build
```

Los archivos de producción se generarán en el directorio `dist/`

## Tecnologías

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS v4
- **Animaciones**: Motion (Framer Motion)
- **Gráficos**: Recharts
- **Escáner QR/Barcode**: html5-qrcode
- **Excel**: XLSX + xlsx-js-style
- **PDF**: pdfjs-dist
- **Base de datos** (opcional): Supabase
- **Notificaciones**: React Hot Toast

## Uso

1. **Cargar planilla maestra**: Sube tu archivo Excel con la información de pallets
2. **Buscar pallets**: Ingresa manualmente, escanea con la cámara, o importa desde PDF/Excel
3. **Ver resultados**: Los pallets se agrupan automáticamente por contenedor
4. **Visualizar estadísticas**: El dashboard muestra gráficos y métricas en tiempo real
5. **Exportar**: Genera un Excel formateado o imprime el documento de carga

## Estructura del Excel Maestro

La aplicación espera las siguientes columnas:

- **Columna C**: Contenedor (ej: FMLU 854344-)
- **Columna D**: Pallets/Cantidad
- **Columna E**: Cajas
- **Columna F**: Kilos
- **Columna G**: Contenido/Descripción
- **Columna H**: Nro Lote / Pallet ID (ej: 278293)

## Licencia

Apache-2.0
