if [ -d ".venv/Scripts" ]; then
  source .venv/Scripts/activate
elif [ -d ".venv/Scripts" ]; then
  source .venv/bin/activate
else
  exit
fi

source scripts/env.sh

cd scraper
python3 main.py &
cd ../chatbot_system
python3 main.py &
cd ../client_server
node cluster.mjs
