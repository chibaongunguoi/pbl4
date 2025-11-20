if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  source .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  source .venv/bin/activate
fi

pip install -r requirements.txt

cd client_server
npm install
npm run build
