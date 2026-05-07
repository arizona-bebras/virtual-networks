# Control Plane Mock

This mock serves the `RouterControlPlane` gRPC service with a static configuration
matching the former router demo config: `primary` and `secondary` networks, each
with a WireGuard instance on `127.0.0.1:51820` and two peers.

```powershell
cd proto/mock
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python .\control_plane_mock.py --address 127.0.0.1:50051
```

Then run the router from the repository root with:

```powershell
$env:ROUTER_CONTROL_PLANE_ADDR = "127.0.0.1:50051"
cd ..\..\router
go run .\cmd\router
```
