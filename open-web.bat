@echo off
cd /d "%~dp0"
start "Malsseumgil Web Server" cmd /k node scripts\serve-web.js
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8090"
