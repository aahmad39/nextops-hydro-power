#!/bin/bash
set -e

sudo mkdir -p /opt/hydro
sudo tar -xzf /home/azureuser/hydro_full_dist.tar.gz -C /opt/hydro

# Setup Python Backend
cd /opt/hydro/backend
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt

# Init DB
cd /opt/hydro/database
sudo ../backend/venv/bin/python init_db.py

# Deploy Frontend
sudo rm -rf /var/www/html/*
sudo cp -r /opt/hydro/frontend/dist/* /var/www/html/

# Create systemd service
sudo bash -c 'cat << "EOF" > /etc/systemd/system/hydro-backend.service
[Unit]
Description=NextOps Hydro Power SCADA FastAPI & Physics Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/hydro/backend
ExecStart=/opt/hydro/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF'

# Configure Nginx
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
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
EOF'

sudo systemctl daemon-reload
sudo systemctl enable --now hydro-backend
sudo systemctl restart hydro-backend
sudo systemctl restart nginx
echo "DEPLOYMENT_SUCCESS"

