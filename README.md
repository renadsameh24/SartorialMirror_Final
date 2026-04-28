# Sartorial Mirror — Teammate Run Instructions (Unity WebGL + React)

This repo contains:
- Unity project (garment renderer + pose pipeline)
- `website/` (React + Vite UI with camera background + Unity overlay)
- Python pose server (FastAPI WebSocket on `ws://127.0.0.1:8000/ws`)

---

## Required Versions

- Unity: **2022.3.62f3** (with **WebGL Build Support**)
- Node.js: **>= 22**
- Python: **3.x**

---

## 0) Clone the Repository

```bash
git clone https://github.com/renadsameh24/SartorialMirror_Final.git
cd SartorialMirror_Final
1) Build Unity WebGL (One-Time Setup)
Open the project in Unity (2022.3.62f3)
Go to:
File → Build Settings
Select:
WebGL → Switch Platform
Click Build and choose a folder, e.g.:
~/Desktop/SartorialMirror_WebGL
Enable WebGL Transparency (IMPORTANT)
In Unity:
Main Camera → Clear Flags = Solid Color
Background Color → Alpha = 0
In WebGL Build Output:
index.html
backgroundColor: [0, 0, 0, 0],
webglContextAttributes: { alpha: true, premultipliedAlpha: false }
TemplateData/style.css
#unity-canvas {
  background: transparent !important;
}

html, body {
  background: transparent !important;
}
2) Run the System (3 Terminals)
Terminal A — Pose Server (Port 8000)
cd python_server
python3 server_fastapi.py
Expected output:
WebSocket endpoint: ws://127.0.0.1:8000/ws
If python_server/ does not exist, try:
cd server
Terminal B — Unity WebGL Host (Port 8080)
cd ~/Desktop/SartorialMirror_WebGL
python3 -m http.server 8080
Open in browser:
http://127.0.0.1:8080/
Terminal C — Website (Vite)
cd website
npm install
npm run dev
Open the Local URL shown in terminal (example):
http://localhost:5174/
Website Environment Variables
Create:
website/.env.local
Add:
VITE_UNITY_WEBGL_URL=http://127.0.0.1:8080/
VITE_UNITY_ALLOWED_ORIGIN=http://127.0.0.1:8080
VITE_RUNTIME_SOURCE_MODE=demo
VITE_CAMERA_UPLINK_ENABLED=false
Expected Behavior (When Working)
Website shows live camera feed as background
Unity WebGL shows garment only (transparent background)
Garment moves in real-time based on pose tracking
Troubleshooting
Unity appears as black/opaque box
→ Fix WebGL transparency settings (see section above)
Garment does not move
→ Ensure pose server is running
→ Confirm WebSocket:
ws://127.0.0.1:8000/ws
Camera turns grey when Unity loads
→ Camera conflict
→ Let website own the camera (recommended)
