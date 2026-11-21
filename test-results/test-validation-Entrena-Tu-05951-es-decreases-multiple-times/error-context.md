# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-validation.spec.js >> Entrena Tu Ser - Validation Tests >> Verify font size increases/decreases multiple times
- Location: tests\test-validation.spec.js:100:3

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Saltar al contenido principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e4]:
    - generic [aria-hidden] [ref=e13]:
      - heading [level=1] [ref=e16]: Entrena tu ser
      - paragraph [ref=e17]: Tu entrenamiento comienza aquí. Sin fricción, solo progreso.
    - region "Iniciar sesión" [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Correo
          - textbox "Correo" [ref=e23]:
            - /placeholder: tu@email.com
        - generic [ref=e24]:
          - generic [ref=e25]: Contraseña
          - textbox "Contraseña" [ref=e26]:
            - /placeholder: ••••••••
        - status [ref=e27]
        - button "Iniciar sesión" [ref=e28] [cursor=pointer]
      - link "¿No tienes cuenta? Crear una" [ref=e31] [cursor=pointer]:
        - /url: "#"
    - generic "Comentarios de la comunidad" [ref=e33]:
      - generic [ref=e35]:
        - generic [ref=e36]: MC
        - generic [ref=e37]:
          - generic [ref=e38]: María C.
          - generic [ref=e39]: "\"El avatar 3D me motiva a no saltarme sesiones\""
      - generic [ref=e41]:
        - generic [ref=e42]: JR
        - generic [ref=e43]:
          - generic [ref=e44]: Jorge R.
          - generic [ref=e45]: "\"Por fin una app que entiende entrenar en casa\""
  - text: + + +
  - complementary "Chatbot de Entrena tu ser" [ref=e46]:
    - button "Abrir asistente de entrenamiento" [ref=e47] [cursor=pointer]
  - complementary "Opciones de accesibilidad" [ref=e50]:
    - button "Abrir opciones de accesibilidad" [active] [ref=e51] [cursor=pointer]
  - option "Cuerpo completo" [selected]
  - option "Fuerza"
  - option "Abdomen y core"
  - option "Movilidad"
  - option "Principiante" [selected]
  - option "Intermedio"
  - option "Avanzado"
  - option "10 minutos"
  - option "20 minutos" [selected]
  - option "30 minutos"
  - contentinfo [ref=e58]:
    - generic [ref=e59]:
      - generic [ref=e60]: Entrena tu ser
      - navigation "Enlaces legales" [ref=e64]:
        - link "Términos y Condiciones" [ref=e65] [cursor=pointer]:
          - /url: "#"
        - link "Política de Privacidad" [ref=e66] [cursor=pointer]:
          - /url: "#"
        - link "Política de Cookies" [ref=e67] [cursor=pointer]:
          - /url: "#"
        - link "Contacto" [ref=e68] [cursor=pointer]:
          - /url: "#"
      - paragraph [ref=e69]: © 2026 Entrena tu ser. Todos los derechos reservados.
```