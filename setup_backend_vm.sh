#!/bin/bash
set -e

sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv git curl libpq-dev

sudo mkdir -p /opt/hydro
sudo tar -xzf /home/azureuser/hydro_full_dist.tar.gz -C /opt/hydro

cd /opt/hydro/backend
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt
sudo ./venv/bin/pip install psycopg2-binary asyncpg

# Set PostgreSQL connection string
export DATABASE_URL="postgresql://hydroadmin:HydroPower2026!#@psql-hydro-canadacen.postgres.database.azure.com:5432/hydro_scada?sslmode=require"

cd /opt/hydro/database
sudo DATABASE_URL="$DATABASE_URL" ../backend/venv/bin/python init_db.py

# Systemd Service for Backend
sudo bash -c "cat << 'EOF' > /etc/systemd/system/hydro-backend.service
[Unit]
Description=NextOps Hydro Power SCADA Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/hydro/backend
Environment=DATABASE_URL=postgresql://hydroadmin:HydroPower2026!#@psql-hydro-canadacen.postgres.database.azure.com:5432/hydro_scada?sslmode=require
ExecStart=/opt/hydro/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable --now hydro-backend
sudo systemctl restart hydro-backend
echo "BACKEND_SUCCESS"

