#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Actualización del sistema
echo -e "${GREEN}[1/6] Actualizando Ubuntu...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Instalación de herramientas básicas
echo -e "${GREEN}[2/6] Instalando dependencias básicas (curl, git, nginx)...${NC}"
sudo apt install -y curl git nginx apache2-utils build-essential

# 3. Instalación de Node.js (v20 LTS)
echo -e "${GREEN}[3/6] Instalando Node.js v20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Configuración de Acceso (Contraseña)
echo -e "${BLUE}----------------------------------------------------${NC}"
read -sp "Introduce la contraseña para acceder a asd.atreyu.net: " APP_PASSWORD
echo -e "\n${BLUE}----------------------------------------------------${NC}"

# Crear el archivo de contraseñas para Nginx
sudo htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"

# 5. Preparación de la aplicación
echo -e "${GREEN}[4/6] Instalando dependencias de la aplicación...${NC}"
npm install

echo -e "${GREEN}[5/6] Compilando la aplicación (Build)...${NC}"
npm run build

# 6. Configuración de Nginx
echo -e "${GREEN}[6/6] Configurando Nginx para asd.atreyu.net...${NC}"

NGINX_CONF="/etc/nginx/sites-available/asd.atreyu.net"
sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name asd.atreyu.net;
    root $(pwd)/dist;
    index index.html;

    location / {
        auth_basic \"Acceso Restringido - Atreyu Servicios Digitales\";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files \$uri \$uri/ /index.html;
    }

    error_log  /var/log/nginx/asd_error.log;
    access_log /var/log/nginx/asd_access.log;
}
EOF"

# Habilitar sitio y reiniciar Nginx
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡INSTALACIÓN COMPLETADA!${NC}"
echo -e "Dominio: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "Usuario: ${BLUE}admin${NC}"
echo -e "Contraseña: ${BLUE}[La que has introducido]${NC}"
echo -e "${BLUE}====================================================${NC}"
