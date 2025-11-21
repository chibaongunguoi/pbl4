if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
else
  exit
fi

. scripts/env.sh

cd scraper
python main.py &
cd ../chatbot_system
python main.py &
cd ../file_system
python main.py &
cd ../client_server
node cluster.mjs
