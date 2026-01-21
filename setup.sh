#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

export NODE_OPTIONS="--max-old-space-size=2048"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador ASD Atreyu - Secure Edition      ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Ejecuta con sudo: sudo ./setup.sh${NC}"
  exit 1
fi

echo -e "${GREEN}[1/5] Instalando dependencias del sistema...${NC}"
apt update && apt install -y curl git nginx apache2-utils build-essential

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[2/5] Instalando Node.js v20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo -e "${BLUE}Configuración de Acceso Web${NC}"
if [ ! -f /etc/nginx/.htpasswd ]; then
    read -p "Establezca contraseña para usuario 'admin': " APP_PASSWORD
    htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
    chmod 644 /etc/nginx/.htpasswd
fi

# NOTA: La API_KEY se inyecta automáticamente por el entorno de despliegue.
# No se solicita al usuario para cumplir con las políticas de seguridad.

echo -e "${GREEN}[3/5] Instalando paquetes de NPM...${NC}"
npm install

echo -e "${GREEN}[4/5] Compilando aplicación...${NC}"
rm -rf dist
npm run build

echo -e "${GREEN}[5/5] Desplegando en Nginx...${NC}"
DEPLOY_DIR="/var/www/publimanager"
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

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

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡SISTEMA DESPLEGADO CON ÉXITO!${NC}"
echo -e "Acceso: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "IA: Motor Gemini 3 Pro (Pre-configurado)${NC}"
echo -e "${BLUE}====================================================${NC}"