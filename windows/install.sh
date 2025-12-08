if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
else
  exit
fi

. scripts/env.sh
mongorestore --db=pbl4_db --uri=$DB_CONNECTION_STRING --drop ./database/seed/pbl4_db

pip install -r requirements.txt

cd client_server
npm install
npm run build
