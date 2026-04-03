# 🤝 Guía de Contribución — LingoLayer

¡Gracias por tu interés en contribuir a LingoLayer! 🎉

## 🚀 Cómo contribuir

### 1. Fork del repositorio

Haz clic en el botón **Fork** en la esquina superior derecha de la página del repositorio.

### 2. Clona tu fork

```bash
git clone https://github.com/TU_USUARIO/LingoLayer.git
cd LingoLayer
```

### 3. Crea una rama para tu cambio

```bash
git checkout -b feature/mi-nueva-funcion
```

### 4. Realiza tus cambios

- Edita los archivos necesarios
- Prueba la extensión cargándola en `chrome://extensions` (modo desarrollador)
- Asegúrate de que todo funcione correctamente

### 5. Haz commit

```bash
git add .
git commit -m "feat: descripción clara de tu cambio"
```

Usa estos prefijos para tus mensajes de commit:
- `feat:` — Nueva funcionalidad
- `fix:` — Corrección de bug
- `docs:` — Cambios en la documentación
- `style:` — Cambios de formato/estilos (no funcionales)
- `refactor:` — Refactorización de código
- `perf:` — Mejoras de rendimiento

### 6. Push y Pull Request

```bash
git push origin feature/mi-nueva-funcion
```

Luego ve a GitHub y crea un **Pull Request** describiendo tus cambios.

---

## 📐 Convenciones de Código

- **Vanilla JS puro** — No se aceptan frameworks ni librerías en el core
- **Naming** — camelCase para variables/funciones, UPPER_CASE para constantes
- **Prefijo** — Usa `ll-` o `lingolayer-` para clases CSS y atributos `data-`
- **Comentarios** — Documenta funciones complejas con comentarios JSDoc
- **Sin minificación** — Mantén el código legible

---

## 🐛 Reportar Bugs

1. Ve a la pestaña **Issues** del repositorio
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Versión de Chrome
   - Capturas de pantalla si aplica

---

## 💡 Sugerir Funcionalidades

Abre un **Issue** con el tag `enhancement` y describe:
- Qué funcionalidad propones
- Por qué sería útil
- Cómo imaginas la implementación

---

## 📁 Estructura del Proyecto

| Carpeta/Archivo | Propósito |
|---|---|
| `scripts/background.js` | Service Worker — API, gamificación, inyección dinámica |
| `scripts/content.js` | Script de contenido — traducción interlineal |
| `scripts/titles.js` | Módulo de títulos (se carga bajo demanda) |
| `scripts/ocr.js` | Módulo OCR con Tesseract.js (se carga bajo demanda) |
| `popup/` | Interfaz del popup |
| `options/` | Página de opciones |
| `styles/` | Todos los estilos CSS |

---

## ⚖️ Licencia

Al contribuir, aceptas que tus contribuciones se publiquen bajo la misma [Licencia MIT](LICENSE) del proyecto.

---

¡Gracias por hacer LingoLayer mejor! 🌐
