cat >$TMP/mongod.cfg <<EOF
storage:
    dbPath: $HOME_DRIVE_LETTER:\\host\\pbl4_db
net:
    bindIp: localhost
    port: 27017
EOF

mongod -f $TMP/mongod.cfg >/dev/null 2>&1 &
rm -r ./database/seed
mongodump --host="localhost" --port=27017 --db=pbl4_db --out="./database/seed"
