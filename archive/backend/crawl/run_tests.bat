@echo off
echo Testing Scrapy-based crawler...
echo.
echo Starting the server...
start "FastAPI Server" cmd /k "python demo.py"
echo.
echo Waiting for server to start...
timeout /t 5 /nobreak > nul
echo.
echo Running tests...
python test_scrapy_api.py
echo.
echo Test complete. Check the server window for any errors.
pause
