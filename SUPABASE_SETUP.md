# Configuración de Supabase

Esta aplicación puede funcionar completamente sin Supabase (los datos se guardan localmente en el navegador). Sin embargo, si deseas guardar planillas en la nube y acceder desde múltiples dispositivos, sigue estos pasos:

## Paso 1: Crear una cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta gratuita

## Paso 2: Crear un nuevo proyecto

1. En el dashboard, haz clic en "New Project"
2. Elige un nombre para tu proyecto
3. Crea una contraseña segura para la base de datos
4. Selecciona una región cercana
5. Haz clic en "Create new project"
6. Espera unos minutos mientras se aprovisiona el proyecto

## Paso 3: Obtener las credenciales

1. En el sidebar, ve a "Settings" > "API"
2. Copia los siguientes valores:
   - **Project URL**: Es algo como `https://abcdefghijklm.supabase.co`
   - **anon/public key**: Una clave larga que empieza con `eyJ...`

## Paso 4: Configurar el archivo .env.local

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores de ejemplo con tus credenciales reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Guarda el archivo

## Paso 5: Reiniciar la aplicación

1. Detén el servidor de desarrollo (Ctrl+C)
2. Reinicia con `npm run dev`
3. Los botones de "Guardar Planilla" y "Mis Planillas" ahora estarán disponibles

## Funcionalidades con Supabase

Una vez configurado, podrás:

- Guardar planillas con nombre
- Ver el historial de planillas guardadas
- Cargar planillas anteriores
- Acceder a tus planillas desde cualquier dispositivo
- Los datos se sincronizan automáticamente en la nube

## Funcionalidades sin Supabase

Si no configuras Supabase, la aplicación seguirá funcionando completamente:

- Los datos se guardan automáticamente en localStorage del navegador
- Funciona offline como PWA
- Puedes exportar a Excel en cualquier momento
- Solo no podrás guardar múltiples planillas con nombre ni sincronizar entre dispositivos

## Solución de Problemas

### Error: "Supabase no está configurado"

Verifica que:
1. Las credenciales en `.env.local` sean correctas
2. El archivo `.env.local` esté en la raíz del proyecto
3. Las variables empiecen con `VITE_` (requerido por Vite)
4. Hayas reiniciado el servidor después de editar el archivo

### Error: "Failed to fetch"

Verifica que:
1. Tu proyecto de Supabase esté activo (no en pausa)
2. La URL sea correcta (sin espacios ni caracteres extra)
3. Tengas conexión a internet

### Error de permisos (RLS)

Las migraciones ya configuraron las políticas de seguridad correctamente. Si ves errores relacionados con RLS, ejecuta:

```bash
npm run db:reset
```

## Privacidad

Tus datos en Supabase son:
- Almacenados en servidores seguros con encriptación
- Accesibles solo desde tu navegador con la clave configurada
- Nunca compartidos con terceros
- Puedes eliminarlos en cualquier momento desde la interfaz
