#!/bin/bash
set -e

# Colores para la terminal
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${RED}      DESINSTALADOR PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Por favor, ejecuta el script con sudo: sudo ./cleanup.sh${NC}"
  exit 1
fi

echo -e "1. Eliminando configuración de Nginx..."
rm -f /etc/nginx/sites-enabled/asd.atreyu.net
rm -f /etc/nginx/sites-available/asd.atreyu.net
# Mantenemos el .htpasswd por seguridad si el usuario no quiere borrar credenciales, 
# pero si quieres borrarlo todo, descomenta la siguiente línea:
# rm -f /etc/nginx/.htpasswd

echo -e "2. Eliminando archivos de producción en /var/www/publimanager..."
rm -rf /var/www/publimanager

echo -e "3. Limpiando dependencias locales y carpetas de compilación..."
rm -rf dist
rm -rf node_modules
rm -f package-lock.json

echo -e "4. Reiniciando servicio Nginx para aplicar cambios..."
if command -v nginx >/dev/null 2>&1; then
    # Intentamos reiniciar Nginx, si falla (porque no hay sitios activos) no detenemos el script
    systemctl restart nginx || true
    echo -e "Servicio Nginx actualizado."
else
    echo -e "Nginx no está instalado, saltando reinicio."
fi

echo -e "${BLUE}====================================================${NC}"
echo -e "${RED}LIMPIEZA COMPLETADA.${NC}"
echo -e "El entorno está listo para una instalación limpia."
echo -e "Puedes ejecutar ahora: ${BLUE}sudo ./setup.sh${NC}"
echo -e "${BLUE}====================================================${NC}"
