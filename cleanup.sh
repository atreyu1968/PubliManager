
#!/bin/bash
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${RED}      DESINSTALADOR PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, ejecuta el script con sudo: sudo ./cleanup.sh${NC}"
  exit
fi

echo -e "Eliminando configuración de Nginx..."
rm -f /etc/nginx/sites-enabled/asd.atreyu.net
rm -f /etc/nginx/sites-available/asd.atreyu.net
rm -f /etc/nginx/.htpasswd

echo -e "Eliminando archivos en /var/www/publimanager..."
rm -rf /var/www/publimanager

echo -e "Limpiando dependencias locales y build..."
rm -rf dist
rm -rf node_modules
rm -f package-lock.json

echo -e "Reiniciando Nginx..."
systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${RED}LIMPIEZA COMPLETADA. Entorno preparado.${NC}"
echo -e "${BLUE}====================================================${NC}"
