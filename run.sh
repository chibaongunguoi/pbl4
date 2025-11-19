if [ -d ".venv/Scripts" ]; then
  source .venv/Scripts/activate
elif [ -d ".venv/Scripts" ]; then
  source .venv/bin/activate
else
  exit
fi

cd ./scraper
python main.py &
cd ../chatbot_system
python main.py &
cd ../client_server
node cluster.mjs
