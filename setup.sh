
#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

export NODE_OPTIONS="--max-old-space-size=2048"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador ASD Atreyu - SQLITE FullStack    ${NC}"
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

echo -e "${GREEN}[3/5] Instalando paquetes de NPM...${NC}"
npm install

echo -e "${GREEN}[4/5] Compilando aplicación y preparando servidor...${NC}"
npm run build

echo -e "${GREEN}[5/5] Configurando Nginx como Proxy Inverso...${NC}"
DEPLOY_DIR="/var/www/publimanager"
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"

NGINX_CONF="/etc/nginx/sites-available/asd.atreyu.net"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name asd.atreyu.net;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        root $DEPLOY_DIR;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl restart nginx

echo -e "${BLUE}Instalando PM2 para mantener el servidor vivo...${NC}"
npm install -g pm2
pm2 start server.js --name "asd-api"
pm2 save

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡SISTEMA DESPLEGADO CON SQLITE CENTRALIZADO!${NC}"
echo -e "Ahora los datos se guardan en el servidor y son comunes."
echo -e "Acceso: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "${BLUE}====================================================${NC}"
