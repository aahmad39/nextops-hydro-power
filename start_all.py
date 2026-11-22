"""
NextOps SCADA - Launch Stack (Backend + Frontend)
Runs FastAPI backend on :8000 and Vite dev server on :3000
"""
import subprocess
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

def main():
    print("=" * 65)
    print(" 🌊 NextOps Industrial - Hydroelectric Digital Twin")
    print(" Unit 2 • 250 MW Live SCADA")
    print("=" * 65)

    # 1. Start Backend Server
    print("\n[1/2] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=BACKEND_DIR
    )

    time.sleep(2)

    # 2. Start Frontend Server
    print("\n[2/2] Starting React Vite Frontend on http://localhost:3000 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR
    )

    print("\n" + "=" * 65)
    print(" 🚀 Stack is LIVE!")
    print(" • Frontend:   http://localhost:3000")
    print(" • Backend:    http://localhost:8000")
    print(" • API Docs:   http://localhost:8000/docs")
    print(" • WebSocket:  ws://localhost:8000/ws/telemetry")
    print("=" * 65)
    print("Press Ctrl+C to stop both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down NextOps Hydro stack...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()

