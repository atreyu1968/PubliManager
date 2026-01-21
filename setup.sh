#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

export NODE_OPTIONS="--max-old-space-size=2048"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - Gemini Edition ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Ejecuta con sudo: sudo ./setup.sh${NC}"
  exit 1
fi

echo -e "${GREEN}[1/6] Instalando dependencias del sistema...${NC}"
apt update && apt install -y curl git nginx apache2-utils build-essential

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[2/6] Instalando Node.js v20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo -e "${BLUE}----------------------------------------------------${NC}"
if [ ! -f /etc/nginx/.htpasswd ]; then
    read -p "Contraseña para usuario 'admin' (Acceso Web): " APP_PASSWORD
    htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
    chmod 644 /etc/nginx/.htpasswd
fi

echo -e "${BLUE}Configuración de Inteligencia Artificial (Google Gemini)${NC}"
read -p "Introduce tu Gemini API Key: " G_KEY
echo "API_KEY=$G_KEY" > .env
echo -e "${GREEN}API Key guardada en .env para la compilación.${NC}"
echo -e "${BLUE}----------------------------------------------------${NC}"

echo -e "${GREEN}[3/6] Instalando paquetes de NPM...${NC}"
npm install

echo -e "${GREEN}[4/6] Compilando aplicación con Vite...${NC}"
rm -rf dist
# La API_KEY se inyecta durante el build
API_KEY=$G_KEY npm run build

echo -e "${GREEN}[5/6] Desplegando archivos en /var/www/publimanager...${NC}"
DEPLOY_DIR="/var/www/publimanager"
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

echo -e "${GREEN}[6/6] Configurando Nginx para asd.atreyu.net...${NC}"
NGINX_CONF="/etc/nginx/sites-available/asd.atreyu.net"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name asd.atreyu.net;
    root $DEPLOY_DIR;
    index index.html;

    location / {
        auth_basic "Acceso Restringido - ASD Atreyu";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files \$uri \$uri/ /index.html;
    }

    error_page 404 /index.html;
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl restart nginx

# Asegurar que el script de actualización sea ejecutable
chmod +x update.sh

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡INSTALACIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "Accede en: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "Para futuras actualizaciones ejecuta: ${BLUE}sudo ./update.sh${NC}"
echo -e "${BLUE}====================================================${NC}"
