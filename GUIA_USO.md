# Guía de Uso - Gestor de Carga de Pallets

## Inicio Rápido

### 1. Cargar la Planilla Maestra

Al abrir la aplicación, verás una pantalla de bienvenida:

1. Arrastra tu archivo Excel (.xlsx o .xls) a la zona indicada, o haz clic en "Seleccionar Archivo"
2. El sistema procesará automáticamente la planilla
3. Si hay errores, verás una vista previa de los datos para verificar el formato

**Nota**: La aplicación guarda automáticamente tus datos. Si cierras el navegador y vuelves, tu trabajo estará exactamente donde lo dejaste.

### 2. Buscar Pallets

Una vez cargada la planilla, tienes 3 formas de buscar pallets:

#### Opción A: Ingreso Manual
- Escribe uno o varios números de pallet en el campo de texto
- Sepáralos por espacios, comas o saltos de línea
- Presiona Enter o haz clic en "Agregar"

#### Opción B: Escanear con Cámara
- Haz clic en el botón "Escanear Código" (ícono de cámara)
- Permite el acceso a la cámara cuando te lo pida el navegador
- Apunta la cámara hacia el código de barras o QR del pallet
- El sistema lo agregará automáticamente a tu lista

#### Opción C: Importar desde Archivo
- Haz clic en "Subir Excel / PDF"
- Selecciona un archivo que contenga números de pallet
- El sistema extraerá automáticamente todos los números de 6-7 dígitos

### 3. Ver Resultados

Los resultados se muestran en tres secciones:

#### Dashboard (Solo si hay búsquedas activas)
- **Progreso**: Porcentaje de pallets escaneados
- **Total Bultos**: Suma de todas las cajas
- **Peso Total**: Peso total en kilogramos
- **Gráficos**: Visualización por contenedor

#### Resumen de Orden de Embarque
- Total de pallets buscados
- Total de bultos
- Peso total
- Cotes de ingreso únicos encontrados

#### Planilla de Carga
- Pallets agrupados por contenedor
- Los pallets buscados están resaltados en amarillo
- Puedes colapsar/expandir cada contenedor haciendo clic en el encabezado

### 4. Barra de Progreso

En la parte superior verás una barra flotante que muestra:
- Cuántos pallets has escaneado
- Cuántos faltan
- Porcentaje de progreso
- Se pone verde cuando completas el 100%

### 5. Gestionar la Lista de Búsqueda

En el panel derecho verás tu lista de búsqueda:

- **Pallets válidos**: Aparecen con fondo blanco
- **Pallets no encontrados**: Aparecen con fondo rojo y advertencia
- **Eliminar uno**: Pasa el mouse sobre el pallet y haz clic en la X
- **Borrar no encontrados**: Botón en la parte superior
- **Borrar todo**: Botón rojo que limpia toda la lista

### 6. Exportar Resultados

Tienes dos opciones:

#### Exportar a Excel
1. Haz clic en "Exportar Excel" (botón verde)
2. Se descargará un archivo `plan_de_carga.xlsx`
3. Los pallets buscados estarán resaltados en amarillo
4. Incluye todos los totales y resúmenes

#### Imprimir
1. Haz clic en "Imprimir"
2. Se abrirá la vista de impresión del navegador
3. El diseño está optimizado para papel A4
4. Los colores y formatos se mantienen

### 7. Modo Oscuro

Haz clic en el ícono de luna/sol en la esquina superior derecha para alternar entre modo claro y oscuro. Tu preferencia se guarda automáticamente.

### 8. Cambiar de Archivo

Si necesitas cargar una nueva planilla maestra:

1. Haz clic en "Cambiar Archivo" (esquina superior derecha)
2. Confirma que quieres borrar los datos actuales
3. Carga el nuevo archivo

**Importante**: Esto borrará toda la lista de búsqueda actual.

## Funciones Avanzadas

### Instalación como Aplicación

Para usar la aplicación sin conexión:

1. Abre la aplicación en Chrome, Edge o Safari
2. Haz clic en el menú del navegador (tres puntos)
3. Selecciona "Instalar Gestor de Carga" o "Agregar a pantalla de inicio"
4. La aplicación se instalará como una app nativa
5. Podrás usarla sin internet (los datos se guardan localmente)

### Uso en Tablet o Celular

La aplicación está completamente optimizada para dispositivos móviles:

- El escáner de códigos es ideal para tablets en el almacén
- El diseño se adapta automáticamente al tamaño de pantalla
- Funciona sin conexión una vez instalada como PWA

### Sincronización con Supabase (Opcional)

Si configuras Supabase, tus datos se sincronizarán en la nube:

1. Crea una cuenta en Supabase
2. Configura las credenciales en `.env.local`
3. Los datos se guardarán tanto local como remotamente
4. Podrás acceder desde múltiples dispositivos

## Solución de Problemas

### "No se encontraron datos válidos"

Verifica que tu Excel tenga:
- Los datos en las columnas correctas (C a H)
- Al menos una fila de datos después del encabezado
- Los números de pallet en la columna H

### "Pallets no encontrados"

Algunos pallets pueden no estar en la planilla maestra:
- Verifica que los números sean correctos
- Revisa si hay espacios o caracteres extra
- Usa el botón "Borrar No Encontrados" para limpiar

### El escáner no funciona

Asegúrate de:
- Permitir el acceso a la cámara cuando te lo pida
- Usar HTTPS (requerido para acceso a cámara)
- Tener buena iluminación
- Que el código esté enfocado y visible

### Los datos no se guardan

Verifica que:
- Tu navegador permita localStorage
- No estés en modo incógnito/privado
- Tengas espacio suficiente en el navegador

## Atajos de Teclado

- **Enter**: Agregar pallet desde el campo de búsqueda
- **Shift + Enter**: Nueva línea en el campo de búsqueda (para pegar múltiples)
- **Ctrl/Cmd + P**: Imprimir (estándar del navegador)

## Soporte

Para reportar errores o sugerir mejoras, por favor contacta al equipo de desarrollo.
