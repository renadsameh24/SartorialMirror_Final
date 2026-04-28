# Sartorial Mirror Middleware Backend

This backend provides the local FastAPI middleware layer for the Sartorial Mirror front-end.

It preserves the existing React integration contract:

- `GET /catalog/snapshot`
- `WS /ws/runtime`
- `WS /ws/camera`
- `GET /healthz`
- `GET /readyz`

The phase-1 runtime is deliberately middleware-first:

- browser camera frames are relayed to the backend
- one active shopper session is managed fully in memory
- runtime events are emitted with stable typed envelopes
- measurements and fit are deterministic heuristics
- late frames, disconnects, and malformed payloads are handled without crashing the service

## Local setup

From the repo root:

```bash
./backend/scripts/setup.sh
./backend/scripts/dev.sh
```

The backend starts on `http://127.0.0.1:8000`.

## Running tests

```bash
python3 -m pytest backend/app/tests -q
```

## Notes

- No database or persistence is used in v1.
- Unity remains a separate local runtime surface.
- Blender remains offline garment prep only.
- The same browser-owned camera feed can power both the local preview and the backend through `WS /ws/camera`.
