# 📚 PubliManager AI - ASD Atreyu

Sistema integral de gestión para editoriales independientes.

## 🚀 Instalación en Ubuntu

### Requisitos
*   Servidor Ubuntu 22.04+
*   Dominio `asd.atreyu.net` configurado.

### Paso 1: Instalar Git y Clonar
```bash
sudo apt update && sudo apt install -y git
git clone https://github.com/atreyu1968/PubliManager.git asd-manager
cd asd-manager
```

### Paso 2: Instalación Automática
```bash
chmod +x setup.sh
sudo ./setup.sh
```

---

## 🧹 Desinstalación / Empezar de cero
Si has tenido errores o quieres eliminar la aplicación por completo antes de reinstalar:

```bash
chmod +x cleanup.sh
sudo ./cleanup.sh
```
Esto eliminará la configuración de Nginx, los archivos web y las dependencias de Node.js, dejando el servidor listo para una instalación limpia con `setup.sh`.

---

## 🛠️ Tecnologías
*   **Frontend**: React 19 + Vite.
*   **Estilos**: Tailwind CSS.
*   **IA**: Google Gemini API.
*   **Servidor**: Nginx sobre Ubuntu.

© 2025 Atreyu Servicios Digitales.