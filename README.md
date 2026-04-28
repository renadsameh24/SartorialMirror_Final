# Sartorial Mirror — Teammate Run Instructions (Unity WebGL + React)

This repo contains:
- Unity project (garment renderer + pose pipeline)
- `website/` (React + Vite UI with camera background + Unity overlay)
- Python pose server (FastAPI WebSocket on `ws://127.0.0.1:8000/ws`)

---

## Required Versions

- Unity: **2022.3.62f3** (with WebGL Build Support)
- Node.js: **>= 22**
- Python: **3.x**

---

## 0) Clone the Repository

```bash
git clone https://github.com/renadsameh24/SartorialMirror_Final.git
cd SartorialMirror_Final
```

---

## 1) Build Unity WebGL (One-Time Setup)

1. Open the project in Unity (2022.3.62f3)
2. Go to: File → Build Settings
3. Select: WebGL → Switch Platform
4. Click Build and choose a folder, for example:
   ~/Desktop/SartorialMirror_WebGL

---

## Enable WebGL Transparency (IMPORTANT)

### In Unity:
- Main Camera → Clear Flags = Solid Color  
- Background Color → Alpha = 0  

### In WebGL Build Output:

#### index.html
```js
backgroundColor: [0, 0, 0, 0],
webglContextAttributes: { alpha: true, premultipliedAlpha: false }
```

#### TemplateData/style.css
```css
#unity-canvas {
  background: transparent !important;
}

html, body {
  background: transparent !important;
}
```

---

## 2) Run the System (3 Terminals)

### Terminal A — Pose Server (Port 8000)

```bash
cd python_server
python3 server_fastapi.py
```

Expected:
```
WebSocket endpoint: ws://127.0.0.1:8000/ws
```

If `python_server/` does not exist:
```bash
cd server
```

---

### Terminal B — Unity WebGL Host (Port 8080)

```bash
cd ~/Desktop/SartorialMirror_WebGL
python3 -m http.server 8080
```

Open:
http://127.0.0.1:8080/

---

### Terminal C — Website (Vite)

```bash
cd website
npm install
npm run dev
```

Open the local URL printed (example):
http://localhost:5174/

---

## Website Environment Variables

Create file:
website/.env.local

Add:

```
VITE_UNITY_WEBGL_URL=http://127.0.0.1:8080/
VITE_UNITY_ALLOWED_ORIGIN=http://127.0.0.1:8080
VITE_RUNTIME_SOURCE_MODE=demo
VITE_CAMERA_UPLINK_ENABLED=false
```

---

## Expected Behavior

- Website shows live camera as background  
- Unity WebGL shows garment only (transparent background)  
- Garment moves in real-time (pose server connected)  

---

## Troubleshooting

**Unity appears black / opaque**
→ Fix WebGL transparency settings

**Garment does not move**
→ Ensure pose server is running  
→ Check WebSocket: ws://127.0.0.1:8000/ws  

**Camera turns grey when Unity loads**
→ Camera conflict  
→ Let website own the camera (recommended)

---

## Notes

If setup fails, run:

```bash
ls python_server
```

or

```bash
ls server
```

Then adjust the pose server command accordingly.
