if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
else
  exit
fi

pip install -r requirements.txt

cd client_server
npm install
npm run build
