if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
else
  exit
fi

cat >$TMP/mongod.cfg <<EOF
storage:
    dbPath: $HOME_DRIVE_LETTER:\\host\\pbl4_db
net:
    bindIp: localhost
    port: 27017
EOF

mongod -f $TMP/mongod.cfg >/dev/null 2>&1 &

. scripts/env.sh
mongorestore --db=pbl4_db --uri=$DB_CONNECTION_STRING --drop ./database/seed/pbl4_db

pip install -r requirements.txt

cd client_server
npm install
npm run build
