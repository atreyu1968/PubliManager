#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Aumentar el límite de memoria para Node.js (2048 = 2GB)
export NODE_OPTIONS="--max-old-space-size=2048"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, ejecuta el script con sudo: sudo ./setup.sh${NC}"
  exit 1
fi

echo -e "${GREEN}[1/7] Instalando dependencias del sistema...${NC}"
apt update && apt install -y curl git nginx apache2-utils build-essential

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[2/7] Instalando Node.js v20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Configuración de contraseñas y claves
echo -e "${BLUE}----------------------------------------------------${NC}"
if [ ! -f /etc/nginx/.htpasswd ]; then
    read -p "Introduce la contraseña para el usuario 'admin' (Web): " APP_PASSWORD
    htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
    chmod 644 /etc/nginx/.htpasswd
fi

# SOLICITUD DE DEEPSEEK API KEY
echo -e "${BLUE}Configuración de Inteligencia Artificial (DeepSeek)${NC}"
read -p "Introduce tu DeepSeek API Key: " DS_KEY
echo "VITE_DEEPSEEK_API_KEY=$DS_KEY" > .env
echo -e "${GREEN}API Key guardada en .env${NC}"
echo -e "${BLUE}----------------------------------------------------${NC}"

echo -e "${GREEN}[3/7] Instalando paquetes de NPM...${NC}"
npm cache clean --force || true
npm install --no-fund --no-audit --prefer-offline

echo -e "${GREEN}[4/7] Compilando aplicación con Vite...${NC}"
# Vite usará la variable VITE_DEEPSEEK_API_KEY del archivo .env
rm -rf dist
npm run build

echo -e "${GREEN}[5/7] Desplegando archivos en /var/www/publimanager...${NC}"
DEPLOY_DIR="/var/www/publimanager"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo -e "${GREEN}[6/7] Configurando Nginx para asd.atreyu.net...${NC}"
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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 404 /index.html;
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡INSTALACIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "Accede en: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "${BLUE}====================================================${NC}"
