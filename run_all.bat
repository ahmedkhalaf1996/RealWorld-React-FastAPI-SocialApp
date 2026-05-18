@echo off

echo Starting FinalAppCourse applications...

echo Starting MongoDB (assuming it's installed as a service or running locally)
:: If you need to start mongodb, you can add the command here.

echo Starting Main API...
start "Main API" cmd /k "cd /d "%~dp0backend\api" & call venv\Scripts\activate.bat & python main.py"

echo Starting RealTimeChat Service...
start "Chat Service" cmd /k "cd /d "%~dp0backend\realTimeChat" & call env\Scripts\activate.bat & python app.py"

echo Starting RealTimeNotification Service...
start "Notification Service" cmd /k "cd /d "%~dp0backend\realTimeNotification" & call env\Scripts\activate.bat & python app.py"

echo Starting React Frontend...
start "React Frontend" cmd /k "cd /d "%~dp0frontend" & npm start"

echo All services have been launched in separate windows!
