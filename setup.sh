#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, ejecuta el script con sudo: sudo ./setup.sh${NC}"
  exit
fi

# 0. Limpieza previa automática
echo -e "${GREEN}[0/7] Limpiando instalaciones anteriores...${NC}"
rm -f /etc/nginx/sites-enabled/asd.atreyu.net
rm -rf /var/www/publimanager
mkdir -p /var/www/publimanager

# 1. Actualización del sistema
echo -e "${GREEN}[1/7] Actualizando Ubuntu...${NC}"
apt update && apt upgrade -y

# 2. Instalación de herramientas básicas
echo -e "${GREEN}[2/7] Instalando dependencias básicas (curl, nginx, tools)...${NC}"
apt install -y curl git nginx apache2-utils build-essential

# 3. Instalación de Node.js (v20 LTS)
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[3/7] Instalando Node.js v20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}[3/7] Node.js ya está instalado.${NC}"
fi

# 4. Configuración de Acceso
echo -e "${BLUE}----------------------------------------------------${NC}"
read -p "Introduce la contraseña para el usuario 'admin': " APP_PASSWORD
htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
chmod 644 /etc/nginx/.htpasswd

# 5. Preparación de la aplicación
echo -e "${GREEN}[4/7] Instalando dependencias de NPM...${NC}"
npm install --no-fund --no-audit

echo -e "${GREEN}[5/7] Generando compilación (Vite Build)...${NC}"
npm run build

# 6. Despliegue
echo -e "${GREEN}[6/7] Desplegando en /var/www/publimanager...${NC}"
DEPLOY_DIR="/var/www/publimanager"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# 7. Configuración de Nginx
echo -e "${GREEN}[7/7] Configurando Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/asd.atreyu.net"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name asd.atreyu.net;
    root $DEPLOY_DIR;
    index index.html;

    location / {
        auth_basic "Acceso Restringido - Atreyu";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡PROCESO FINALIZADO!${NC}"
echo -e "Web: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "User: admin / Pass: [la que elegiste]"
echo -e "${BLUE}====================================================${NC}"
