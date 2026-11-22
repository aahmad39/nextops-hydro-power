#!/bin/bash
set -e

sudo apt-get update -y
sudo apt-get install -y nginx curl

sudo mkdir -p /opt/hydro
sudo tar -xzf /home/azureuser/hydro_full_dist.tar.gz -C /opt/hydro

# Deploy Frontend build
sudo rm -rf /var/www/html/*
sudo cp -r /opt/hydro/frontend/dist/* /var/www/html/

# Nginx config routing API and WebSocket to Backend VM Private IP (10.0.2.4)
sudo bash -c 'cat << "EOF" > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://10.0.2.4:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://10.0.2.4:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
EOF'

sudo systemctl restart nginx
echo "FRONTEND_SUCCESS"

