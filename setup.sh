#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   Auto-Instalador PubliManager AI - ASD Atreyu    ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, ejecuta el script con sudo: sudo ./setup.sh${NC}"
  exit
fi

# 1. Actualización del sistema
echo -e "${GREEN}[1/7] Actualizando Ubuntu...${NC}"
apt update && apt upgrade -y

# 2. Instalación de herramientas básicas
echo -e "${GREEN}[2/7] Instalando dependencias básicas (curl, git, nginx)...${NC}"
apt install -y curl git nginx apache2-utils build-essential

# 3. Instalación de Node.js (v20 LTS)
echo -e "${GREEN}[3/7] Instalando Node.js v20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# 4. Configuración de Acceso (Contraseña)
echo -e "${BLUE}----------------------------------------------------${NC}"
echo -e "Configura el acceso para admin en asd.atreyu.net"
read -p "Introduce la contraseña deseada: " APP_PASSWORD
echo -e "\n${BLUE}----------------------------------------------------${NC}"

# Crear el archivo de contraseñas para Nginx
htpasswd -bc /etc/nginx/.htpasswd admin "$APP_PASSWORD"
chmod 644 /etc/nginx/.htpasswd

# 5. Preparación de la aplicación
echo -e "${GREEN}[4/7] Instalando dependencias de NPM...${NC}"
# Forzamos la instalación en el directorio actual antes de mover
npm install

echo -e "${GREEN}[5/7] Compilando la aplicación (Build)...${NC}"
# Usamos directamente vite build para evitar paradas por tsc en server
npx vite build

# 6. Despliegue en directorio web estándar
echo -e "${GREEN}[6/7] Desplegando archivos en /var/www/publimanager...${NC}"
DEPLOY_DIR="/var/www/publimanager"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# 7. Configuración de Nginx
echo -e "${GREEN}[7/7] Configurando Nginx para asd.atreyu.net...${NC}"

NGINX_CONF="/etc/nginx/sites-available/asd.atreyu.net"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name asd.atreyu.net;
    root $DEPLOY_DIR;
    index index.html;

    location / {
        auth_basic "Acceso Restringido - Atreyu Servicios Digitales";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files \$uri \$uri/ /index.html;
    }

    # Optimización de caché para estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_log  /var/log/nginx/asd_error.log;
    access_log /var/log/nginx/asd_access.log;
}
EOF

# Habilitar sitio y reiniciar Nginx
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}¡INSTALACIÓN COMPLETADA CON ÉXITO!${NC}"
echo -e "Dominio: ${BLUE}http://asd.atreyu.net${NC}"
echo -e "Usuario: ${BLUE}admin${NC}"
echo -e "Contraseña: ${BLUE}[La que has introducido]${NC}"
echo -e "${BLUE}====================================================${NC}"
