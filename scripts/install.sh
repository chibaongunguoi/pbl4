if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
fi

pip install -r requirements.txt

cd client_server
sudo npm install
sudo npm run build
