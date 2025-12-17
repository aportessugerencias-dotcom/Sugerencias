# Configuración de Plantillas de Email en Supabase

Para que el sistema envíe un **Código Numérico (OTP)** en lugar de un "Magic Link", debes configurar las plantillas de correo en tu panel de Supabase.

1.  Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2.  En el menú lateral, ve a **Authentication** -> **Configuration** -> **Email Templates**.
3.  Verás varias plantillas. Debes modificar **"Magic Link"** y, si es necesario, **"Confirm Signup"**.

### 1. Plantilla "Magic Link" (Para el login)

Esta es la que se usa cuando intentas ingresar con código.

*   **Subject (Asunto):** `Tu código de acceso`
*   **Body (Cuerpo):**
    Borra lo que hay y pega algo como esto:
    ```html
    <h2>Código de Verificación</h2>
    <p>Tu código para ingresar es:</p>
    <h1>{{ .Token }}</h1>
    <p>Este código expira en 5 minutos.</p>
    ```
    *Lo importante es reemplazar `{{ .ConfirmationURL }}` por `{{ .Token }}`.*

### 2. Plantilla "Confirm Signup" (Confirmar Registro)

Si te llega un correo con asunto "Confirm Your Signup", significa que tu usuario aún no ha verificado su email por primera vez. Para ver el código en este caso también:

*   **Subject:** `Confirma tu registro`
*   **Body:**
    ```html
    <h2>Código de Confirmación</h2>
    <p>Tu código de confirmación es:</p>
    <h1>{{ .Token }}</h1>
    ```

---

Una vez guardados estos cambios en Supabase, vuelve a intentar el login desde la aplicación y te llegará el número.
