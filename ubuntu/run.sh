if [ -d ".venv/bin" ]; then
  . .venv/bin/activate
else
  exit
fi

. scripts/env.sh

cd scraper
python3 main.py &
cd ../chatbot_system
python3 main.py &
cd ../file_system
python3 main.py &
cd ../client_server
node cluster.mjs
