<div align="center">

# 🌐 LingoLayer

### Traducción interlineal de Inglés a Español — directamente en tu navegador

[![Donar con PayPal](https://img.shields.io/badge/Donar-PayPal-gold?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=NXN5HXZ3Y9BSG)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](#instalación)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-00C853?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)](LICENSE)

---

**LingoLayer** coloca traducciones al español debajo del texto original en inglés mientras navegas. Sin cambiar de pestaña, sin copiar y pegar. Lee y aprende inglés de forma natural.

</div>

---

## ✨ Características

| Característica | Descripción |
|---|---|
| 📝 **Traducción Interlineal** | Traducciones al español debajo de cada párrafo u oración |
| 🎯 **Dos Modos Base** | Traducción por párrafo o por oración |
| 🎮 **Sistema de Gamificación** | Desbloquea modos especiales mientras más traduzcas |
| 📑 **Modo Títulos** | Traduce dinámicamente los títulos de las páginas (desbloqueable) |
| 🖼️ **Modo OCR** | Extrae y traduce texto de imágenes con Tesseract.js (desbloqueable) |
| ⚡ **Ultra Ligero** | 100% Vanilla JS, sin dependencias en el core |
| 🌙 **Diseño Premium** | Interfaz dark mode con glassmorphism |
| 💛 **Open Source** | Código libre bajo licencia MIT |

---

## 🎮 Sistema de Niveles

Traduce páginas web y desbloquea funciones especiales:

| Nivel | Palabras | Rango | Desbloqueo |
|:---:|:---:|---|---|
| 0 | 0 | 📖 Novato | Modos base |
| 1 | 500 | 📚 Aprendiz | — |
| 2 | **1,000** | 🗺️ Explorador | 🔓 **Modo Títulos** |
| 3 | 2,500 | 🎯 Traductor | — |
| 4 | **5,000** | ⚡ Experto | 🔓 **Modo OCR (Imágenes)** |
| 5 | 10,000 | 🏆 Maestro | Badge especial |

---

## 📦 Instalación

### Desde el código fuente (para desarrolladores)

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/laleiker/LingoLayer.git
   ```

2. **Abre Chrome** y navega a:
   ```
   chrome://extensions
   ```

3. **Activa** el "Modo de desarrollador" (esquina superior derecha)

4. **Clic en** "Cargar extensión desempaquetada"

5. **Selecciona** la carpeta `LingoLayer/` que clonaste

6. **¡Listo!** El ícono de LingoLayer aparecerá en tu barra de extensiones 🎉

---

## 🛠️ Estructura del Proyecto

```
LingoLayer/
├── manifest.json           # Manifest V3
├── icons/                  # Íconos de la extensión
├── popup/
│   ├── popup.html          # Interfaz del popup
│   └── popup.js            # Lógica del popup
├── options/
│   ├── options.html         # Página de opciones
│   └── options.js           # Lógica de opciones
├── scripts/
│   ├── background.js       # Service Worker (API + gamificación)
│   ├── content.js          # Script de contenido (traducción)
│   ├── titles.js           # Módulo de títulos (lazy loaded)
│   └── ocr.js              # Módulo OCR con Tesseract.js (lazy loaded)
├── styles/
│   ├── popup.css           # Estilos del popup
│   ├── options.css         # Estilos de opciones
│   └── styles.css          # Estilos de las traducciones
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .github/
    └── FUNDING.yml
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee nuestra [Guía de Contribución](CONTRIBUTING.md) para comenzar.

---

## 💛 Apoya este proyecto

LingoLayer es un proyecto gratuito y de código abierto. Si te resulta útil, considera hacer una donación. Tu apoyo ayuda a mantener el proyecto actualizado y a pagar el café del desarrollador ☕

<div align="center">

[![Donar con PayPal](https://img.shields.io/badge/☕_Invítanos_un_café-PayPal-gold?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=NXN5HXZ3Y9BSG)

</div>

---

## 👥 Créditos

<table>
  <tr>
    <td align="center">
      <strong>laleiker</strong><br>
      <sub>Creador & Desarrollador</sub>
    </td>
    <td align="center">
      <strong>Nekorb</strong><br>
      <sub>Co-creador & Colaborador</sub>
    </td>
  </tr>
</table>

Agradecimiento especial a **Nekorb** por su apoyo incondicional en este proyecto desde el principio. Sin su ayuda, LingoLayer no existiría. 🙌

---

## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE). Puedes usarlo, modificarlo y distribuirlo libremente.

---

<div align="center">

Hecho con ❤️ por laleiker & Nekorb

</div>
