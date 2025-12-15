if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
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

cd scraper
python main.py &
cd ../chatbot_system
python main.py &
cd ../file_system
python main.py &
cd ../client_server
node cluster.mjs
