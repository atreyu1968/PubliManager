# 📚 PubliManager AI - ASD Atreyu

Sistema integral de gestión para editoriales independientes, optimizado para el flujo de trabajo en Amazon KDP y Draft2Digital. Esta aplicación permite gestionar múltiples sellos, seudónimos, catálogos y seguimiento de ventas con asistencia de Inteligencia Artificial (Google Gemini).

## 🚀 Instalación en Ubuntu

La aplicación está preparada para ser desplegada en un servidor Ubuntu bajo el dominio `asd.atreyu.net`.

### Requisitos Previos
*   Un servidor con Ubuntu 22.04 LTS o superior.
*   Dominio `asd.atreyu.net` apuntando a la IP de tu servidor.
*   Permisos de superusuario (sudo).

### Proceso de Autoinstalación

Para poder descargar el código en un servidor recién instalado, **primero debes instalar Git**. Sigue estos pasos exactos:

1.  **Conéctate a tu servidor** por SSH.
2.  **Instala Git** (paso obligatorio antes de clonar):
    ```bash
    sudo apt update && sudo apt install -y git
    ```
3.  **Clona el repositorio oficial**:
    ```bash
    git clone https://github.com/atreyu1968/PubliManager.git asd-manager
    cd asd-manager
    ```
4.  **Ejecuta el script de instalación automática**:
    ```bash
    chmod +x setup.sh
    sudo ./setup.sh
    ```

**¿Qué hace el script?**
*   **Actualización**: Actualiza Ubuntu e instala `curl`, `nginx` y `Node.js v20`.
*   **Construcción**: Instala las dependencias y compila el proyecto para producción (`npm run build`).
*   **Seguridad**: Configura un acceso protegido mediante **Basic Auth** (te pedirá la contraseña durante el proceso).
*   **Servidor Web**: Configura Nginx para servir la aplicación de forma óptima en `http://asd.atreyu.net`.

---

## 🛠️ Funcionamiento de la Aplicación

### 1. Panel de Control (Dashboard)
Visualización ejecutiva del estado de la editorial:
*   **Métricas en Tiempo Real**: Libros publicados, ingresos brutos estimados y total de páginas leídas (KENPC).
*   **Gráficos Analíticos**: Evolución mensual de ventas y rendimiento de lectura.
*   **Hitos Próximos**: Acceso rápido a las tareas más urgentes de la agenda.

### 2. Agenda Continua (7 Días)
Un sistema de seguimiento dinámico diseñado para la productividad diaria:
*   **Vista de 7 Días**: Muestra tareas de metadatos, marketing y producción previstas para la semana.
*   **Eventos Automáticos**: Los lanzamientos de libros aparecen marcados en verde el día de su publicación.
*   **Gestión de Tareas**: Permite marcar tareas como completadas directamente desde la vista de calendario.

### 3. Catálogo y Gestión de Recursos
Centralización total de la producción editorial:
*   **Fichas de Libro**: Gestión de portadas, sinopsis, ISBN y precios.
*   **Recursos Directos**: Enlaces rápidos a la consola de Amazon KDP, Draft2Digital y la carpeta de producción en Google Drive.
*   **Estrategia KU**: Control visual de libros inscritos en Kindle Unlimited y aplicación de estrategias de "Readthrough".

### 4. Seguimiento de Ventas y KENPC
Registro histórico de ingresos:
*   **Multiplataforma**: Soporte para reportes de KDP y D2D.
*   **Métricas KENP**: Control específico de las páginas leídas para optimizar lanzamientos en Amazon.
*   **Tabla Histórica**: Historial completo filtrable por libro y fecha.

### 5. Laboratorio de IA (Gemini 3 Flash)
Asistente editorial avanzado integrado para:
*   **Copywriting**: Optimización de blurbs con técnicas de SEO para Amazon.
*   **Ads**: Generación de titulares persuasivos para campañas publicitarias.
*   **Localización**: Adaptación cultural y traducción de metadatos a otros mercados.
*   **Agradecimientos**: Redacción de textos finales basados en la biografía del autor.

---

## ⚙️ Tecnologías Utilizadas
*   **Frontend**: React 19 + Vite.
*   **Estilos**: Tailwind CSS (Diseño "Dark Slate" Premium).
*   **Gráficos**: Recharts.
*   **IA**: Google Gemini API (@google/genai).
*   **Almacenamiento**: Persistencia local robusta (Simulación de arquitectura SQLite para entorno SPA).
*   **Despliegue**: Nginx + Ubuntu Server.

---

## 👨‍💻 Créditos y Copyright
Desarrollado para **Atreyu Servicios Digitales**.
© 2024-2025 Atreyu Servicios Digitales. Todos los derechos reservados.
Logo y marca **ASD** son propiedad exclusiva.