
# 📚 PubliManager AI - ASD Atreyu

Sistema integral de gestión para editoriales independientes. Optimizado para el control de sellos, seudónimos, distribución en Amazon KDP y Draft2Digital (D2D).

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

## 🔄 Actualización
Para aplicar nuevos cambios o corregir errores en el servidor de producción, utiliza el script de actualización automatizada:

```bash
# 1. Dar permisos de ejecución (solo la primera vez)
chmod +x update.sh

# 2. Ejecutar el actualizador
sudo ./update.sh
```

**¿Qué hace este script?**
*   Sincroniza el código con el repositorio principal (`git pull`).
*   Instala nuevas dependencias necesarias (`npm install`).
*   Compila la versión de producción (`npm run build`).
*   Despliega los archivos en `/var/www/publimanager`.
*   Reinicia **Nginx** para aplicar los cambios instantáneamente.

---

## 🧹 Desinstalación / Empezar de cero
Si quieres eliminar la aplicación por completo antes de reinstalar:

```bash
chmod +x cleanup.sh
sudo ./cleanup.sh
```
Esto eliminará la configuración de Nginx, los archivos web y las dependencias de Node.js, dejando el servidor listo para una instalación limpia con `setup.sh`.

---

## 🛠️ Tecnologías
*   **Frontend**: React 19 + Vite.
*   **Estilos**: Tailwind CSS.
*   **IA**: Google Gemini 3 Pro (Deep Reasoning).
*   **Servidor**: Nginx sobre Ubuntu.

© 2025 Atreyu Servicios Digitales.
