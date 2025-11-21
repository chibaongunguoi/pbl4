if [ -d ".venv/Scripts" ]; then
  . .venv/Scripts/activate
elif [ -d ".venv/bin" ]; then
  . .venv/bin/activate
else
  exit
fi

cd keyboard
python main.py
