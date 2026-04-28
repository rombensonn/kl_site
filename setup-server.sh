#!/bin/bash
set -euo pipefail

DOMAIN="kovallabs.com"
WWW_DOMAIN="www.kovallabs.com"
APP_DIR="/var/www/kovallabs"
APP_PORT="3001"
SERVICE_NAME="kovallab"
EMAIL="admin@kovallabs.com"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[ok]${NC} $1"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[err]${NC} $1"; }
step()  { echo -e "\n${GREEN}==>${NC} $1"; }

find_source_dir() {
  local candidates=(
    "$SCRIPT_DIR"
    "$(pwd)"
    "/root/kovall"
    "/home/kovall/kovall"
    "$APP_DIR"
  )

  for dir in "${candidates[@]}"; do
    if [ -f "$dir/package.json" ] && [ -f "$dir/server.js" ]; then
      echo "$dir"
      return 0
    fi
  done

  return 1
}

copy_if_exists() {
  local source="$1"
  local target="$2"
  if [ -e "$source" ]; then
    cp -f "$source" "$target"
  fi
}

if [ "${EUID}" -ne 0 ]; then
  error "Run this script as root: sudo bash $0"
  exit 1
fi

step "Updating system packages"
apt update
apt upgrade -y
info "System packages updated"

step "Installing Node.js 22"
if command -v node >/dev/null 2>&1; then
  NODE_VER="$(node -p 'process.versions.node.split(`.`)[0]')"
  if [ "$NODE_VER" -lt 22 ]; then
    warn "Node.js $(node -v) is too old, reinstalling"
    apt remove -y nodejs npm
  fi
fi

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(`.`)[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
info "Using Node.js $(node -v)"

step "Installing nginx and certbot"
apt install -y nginx certbot python3-certbot-nginx
info "nginx and certbot installed"

step "Locating project sources"
SOURCE_DIR="$(find_source_dir || true)"
if [ -z "$SOURCE_DIR" ]; then
  error "Project source directory not found. Put the repo on the server and run the script from that repo."
  exit 1
fi
info "Using source directory: $SOURCE_DIR"

step "Installing dependencies and building"
cd "$SOURCE_DIR"
npm install --legacy-peer-deps
npm run build

if [ ! -d "$SOURCE_DIR/dist" ]; then
  error "Build did not produce $SOURCE_DIR/dist"
  exit 1
fi
info "Build completed"

step "Deploying application files"
mkdir -p "$APP_DIR"
rm -rf "$APP_DIR/dist"
cp -r "$SOURCE_DIR/dist" "$APP_DIR/dist"
copy_if_exists "$SOURCE_DIR/server.js" "$APP_DIR/server.js"
copy_if_exists "$SOURCE_DIR/package.json" "$APP_DIR/package.json"
copy_if_exists "$SOURCE_DIR/package-lock.json" "$APP_DIR/package-lock.json"
copy_if_exists "$SOURCE_DIR/.env" "$APP_DIR/.env"
mkdir -p "$APP_DIR/data"
chown -R www-data:www-data "$APP_DIR"
info "Application deployed to $APP_DIR"

step "Creating systemd service"
cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SYSTEMD
[Unit]
Description=Kovallab Node application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl --no-pager --full status "$SERVICE_NAME" || true
info "systemd service $SERVICE_NAME configured"

step "Configuring nginx"
cat > "/etc/nginx/sites-available/$DOMAIN" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
info "nginx configured"

step "Requesting Let's Encrypt certificate"
certbot --nginx \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect \
  --hsts \
  --staple-ocsp
info "SSL certificate installed"

step "Configuring certificate auto-renewal"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
info "Auto-renewal configured"

echo
echo "============================================"
echo -e "${GREEN}Deployment complete${NC}"
echo "Site: https://$DOMAIN"
echo "Site: https://$WWW_DOMAIN"
echo "App dir: $APP_DIR"
echo "Service: systemctl status $SERVICE_NAME"
echo "Logs: journalctl -u $SERVICE_NAME -f"
echo "Nginx logs: /var/log/nginx/"
echo "============================================"
