#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Aumentar el límite de memoria para Node.js (2048 = 2GB)
# Esto evita el error FatalProcessOutOfMemory durante la compilación de Tailwind
export NODE_OPTIONS="--max-old-space-size=2048"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, ejecuta el script con sudo: sudo ./setup.sh${NC}"
  exit 1
fi

echo -e "${GREEN}[1/6] Instalando dependencias del sistema...${NC}"
apt update && apt install -y curl git nginx apache2-utils build-essential

if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[2/6] Instalando Node.js v20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

if [ ! -f /etc/nginx/.htpasswd ]; then
    echo -e "${BLUE}----------------------------------------------------${NC}"
    read -p "Introduce la contraseña para el usuario 'admin': " APP_PASSWORD
    htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
    chmod 644 /etc/nginx/.htpasswd
fi

echo -e "${GREEN}[3/6] Instalando paquetes de NPM (Modo Optimizado)...${NC}"
# Limpiar caché y realizar instalación optimizada para bajos recursos
npm cache clean --force || true
npm install --no-fund --no-audit --prefer-offline

echo -e "${GREEN}[4/6] Compilando aplicación con Vite...${NC}"
# Forzamos la limpieza absoluta antes de compilar
rm -rf dist
npm run build

echo -e "${GREEN}[5/6] Desplegando archivos en /var/www/publimanager...${NC}"
DEPLOY_DIR="/var/www/publimanager"
rm -rf "$DEPLOY_DIR"
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
