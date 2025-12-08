rm -r ./database/seed
mongodump --host="localhost" --port=27017 --db=pbl4_db --out="./database/seed"
