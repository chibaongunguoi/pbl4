cat >$TMP/mongod.cfg <<EOF
storage:
    dbPath: $HOME_DRIVE_LETTER:\\host\\pbl4_db
net:
    bindIp: localhost
    port: 27017
EOF

mongod -f $TMP/mongod.cfg
