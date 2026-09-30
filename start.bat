@echo off
rem Serves Meridian Atlas on http://localhost:8765 and opens it in your browser.
cd /d "%~dp0"
start "" http://localhost:8765/
python tools\serve.py
