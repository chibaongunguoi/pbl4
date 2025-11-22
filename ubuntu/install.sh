sudo apt install -y curl gnupg nodejs npm python3 python3.12-venv

curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc |
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org mongodb-database-tools
sudo systemctl enable mongod
sudo systemctl start mongod
. scripts/env.sh

mongorestore --db=pbl4_db --uri=$DB_CONNECTION_STRING --drop ./database/seed/pbl4_db

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
fi

pip install -r requirements.txt

cd client_server
sudo npm install
sudo npm run build
