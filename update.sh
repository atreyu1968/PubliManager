#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}    Actualizador PubliManager AI - ASD Atreyu       ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Verificar privilegios
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Por favor, ejecuta el script con sudo: sudo ./update.sh${NC}"
  exit 1
fi

# 2. Actualizar desde repositorio (si aplica)
echo -e "${GREEN}[1/5] Obteniendo cambios desde el repositorio...${NC}"
if [ -d ".git" ]; then
    git pull origin main || echo -e "${RED}Aviso: No se pudo hacer git pull (quizás no hay cambios o no hay remoto). Continuando...${NC}"
else
    echo -e "${BLUE}Aviso: No se detectó un repositorio git. Saltando este paso.${NC}"
fi

# 3. Actualizar dependencias
echo -e "${GREEN}[2/5] Actualizando dependencias de Node.js...${NC}"
npm install

# 4. Compilación
echo -e "${GREEN}[3/5] Compilando aplicación para producción...${NC}"
# Obtenemos la API KEY del .env si existe para asegurar consistencia
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

npm run build

# 5. Despliegue de archivos
echo -e "${GREEN}[4/5] Desplegando archivos en el servidor...${NC}"
DEPLOY_DIR="/var/www/publimanager"
if [ ! -d "$DEPLOY_DIR" ]; then
    mkdir -p "$DEPLOY_DIR"
fi

cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# 6. Reiniciar Nginx
echo -e "${GREEN}[5/5] Reiniciando Nginx...${NC}"
systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!${NC}"
echo -e "Sitio disponible en: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "${BLUE}====================================================${NC}"
