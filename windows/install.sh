set -e

if [ ! -d ".venv" ]; then
  echo Start creating venv...
  python -m venv .venv
  echo Done sreating venv.
fi

echo Activating venv...
if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
else
  exit
fi
echo Activated venv.

echo Start database...
cat >$TMP/mongod.cfg <<EOF
storage:
    dbPath: $HOME_DRIVE_LETTER:\\host\\pbl4_db
net:
    bindIp: localhost
    port: 27017
EOF

mongod -f $TMP/mongod.cfg >/dev/null 2>&1 &
echo Started database.

echo Restoring database...
. scripts/env.sh
mongorestore --db=pbl4_db --uri=$DB_CONNECTION_STRING --drop ./database/seed/pbl4_db
echo Restored database.

pip install -r requirements.txt

cd client_server
npm install
npm run build
