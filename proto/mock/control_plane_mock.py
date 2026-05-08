from __future__ import annotations

import argparse
import base64
import json
import logging
import sys
import tempfile
import time
from concurrent import futures
from pathlib import Path
from typing import Any

import grpc
import grpc_tools
from google.protobuf import json_format
from grpc_tools import protoc


REVISION = "mock-static-1"
KEYS = {
    "server-primary": (
        "YM0F8jQ+Qrc+2mNWUw3HeaH4hTVUbP78I3bBE/kekUg=",
        "wrLQuFIunLmQbDc3AFin1X/7vKHKGpbKa9Nc7M4svXY=",
    ),
    "server-secondary": (
        "8HDJUD7WxZm66XK/ccWWW4ZfWCi1N6IAyVfdjWWAA3o=",
        "RLfHKd8iJ0YfuwTHcYf+fltnY5nG09jzffXxbKoHJGE=",
    ),
    "primary-peer-1": (
        "wILL9118d3g4QhT0brK0Qrm66iSy13haHqfvlkaj6lY=",
        "xmvO+JJP8g8Uw7Jvq6IG1E8CN/AG6L9mLyJtu7nH43o=",
    ),
    "primary-peer-2": (
        "EPQ5fk29T/ZzRUSKTaGcCEQhYsw+qLYAznufp2ReCEo=",
        "Lukx7dxexJ1z2esHjuMqDNAofw+izuj521L8BzOE9UI=",
    ),
    "secondary-peer-1": (
        "YHSVM98rNY4nTSlYoT+WJf45DqGXt7fa13ZF0Z0n83Q=",
        "G/7SyavBaDZ0+x8hkY9sZpIugv7ClwG57YAT7wq/SFA=",
    ),
    "secondary-peer-2": (
        "8NZzN116A1UOn+dmNX9qpJBsxxq0KfUJohnK+LK452U=",
        "b8TjRRaNSAcF/tyWE/rKu3T7SLtJU2IBsIiDPMHQl1o=",
    ),
}


def load_generated_modules() -> tuple[Any, Any]:
    proto_root = Path(__file__).resolve().parents[1]
    proto_file = proto_root / "src" / "controlplane.proto"
    generated_dir = Path(tempfile.mkdtemp(prefix="virtual-networks-controlplane-py-"))
    grpc_tools_include = Path(grpc_tools.__file__).resolve().parent / "_proto"

    result = protoc.main(
        [
            "grpc_tools.protoc",
            f"-I{proto_root / 'src'}",
            f"-I{grpc_tools_include}",
            f"--python_out={generated_dir}",
            f"--grpc_python_out={generated_dir}",
            str(proto_file),
        ]
    )
    if result != 0:
        raise RuntimeError(f"protoc failed with exit code {result}")

    sys.path.insert(0, str(generated_dir))
    import controlplane_pb2  # type: ignore[import-not-found] # ty: ignore[unresolved-import] # pyright: ignore
    import controlplane_pb2_grpc  # type: ignore[import-not-found] # ty: ignore[unresolved-import] # pyright: ignore

    return controlplane_pb2, controlplane_pb2_grpc


pb, pb_grpc = load_generated_modules()


def log_message(name: str, message: Any) -> None:
    payload = json_format.MessageToDict(
        message,
        preserving_proto_field_name=True,
        always_print_fields_with_no_presence=True,
    )
    logging.info("%s %s", name, json.dumps(payload, sort_keys=True))


def private_key(name: str) -> bytes:
    return base64.b64decode(KEYS[name][0])


def public_key(name: str) -> bytes:
    return base64.b64decode(KEYS[name][1])


def peer(peer_id: str, network_id: str, address: str) -> Any:
    return pb.PeerConfig(
        id=peer_id,
        network_id=network_id,
        address=address,
        allowed_ips=[f"{address}/32"],
        wireguard=pb.WireGuardPeerConfig(public_key=public_key(peer_id)),
    )


def static_configuration() -> Any:
    return pb.RouterConfiguration(
        revision=REVISION,
        networks=[
            pb.NetworkConfig(
                id="primary",
                name="primary",
                cidr="10.44.0.0/24",
                server_address="10.44.0.1",
                mtu=1420,
                status_port=8080,
                peers=[
                    peer("primary-peer-1", "primary", "10.44.0.2"),
                    peer("primary-peer-2", "primary", "10.44.0.3"),
                ],
            ),
            pb.NetworkConfig(
                id="secondary",
                name="secondary",
                cidr="10.44.0.0/24",
                server_address="10.44.0.1",
                mtu=1420,
                status_port=8080,
                peers=[
                    peer("secondary-peer-1", "secondary", "10.44.0.2"),
                    peer("secondary-peer-2", "secondary", "10.44.0.3"),
                ],
            ),
        ],
        protocols=[
            pb.ProtocolInstanceConfig(
                id="wg-primary",
                name="wireguard",
                network_id="primary",
                listen_port=51820,
                public_host="127.0.0.1",
                wireguard=pb.WireGuardProtocolConfig(
                    interface_private_key=private_key("server-primary"),
                    interface_public_key=public_key("server-primary"),
                    persistent_keepalive_seconds=25,
                ),
            ),
            pb.ProtocolInstanceConfig(
                id="wg-secondary",
                name="wireguard",
                network_id="secondary",
                listen_port=51820,
                public_host="127.0.0.1",
                wireguard=pb.WireGuardProtocolConfig(
                    interface_private_key=private_key("server-secondary"),
                    interface_public_key=public_key("server-secondary"),
                    persistent_keepalive_seconds=25,
                ),
            ),
        ],
    )


def print_peer_configs(configuration: Any) -> None:
    networks = {network.id: network for network in configuration.networks}
    print("\n=== Mock WireGuard peer configs ===")
    for protocol in configuration.protocols:
        network = networks[protocol.network_id]
        endpoint = f"{protocol.public_host}:{protocol.listen_port}"
        server_public_key = base64.b64encode(protocol.wireguard.interface_public_key).decode()
        keepalive = protocol.wireguard.persistent_keepalive_seconds
        for config_peer in network.peers:
            peer_private_key = KEYS[config_peer.id][0]
            print(f"\n# {config_peer.id} -> {protocol.id}")
            print("[Interface]")
            print(f"PrivateKey = {peer_private_key}")
            print(f"Address = {config_peer.address}/32")
            print(f"DNS = {network.server_address}")
            print()
            print("[Peer]")
            print(f"PublicKey = {server_public_key}")
            print(f"AllowedIPs = {network.cidr}")
            print(f"Endpoint = {endpoint}")
            print(f"PersistentKeepalive = {keepalive}")
    print()


class RouterControlPlaneMock(pb_grpc.RouterControlPlaneServicer):
    def __init__(self, watch_interval_seconds: float) -> None:
        self._watch_interval_seconds = watch_interval_seconds

    def WatchRouterConfiguration(self, request: Any, context: grpc.ServicerContext) -> Any:
        log_message("WatchRouterConfiguration", request)
        yield pb.RouterConfigurationUpdate(
            revision=REVISION,
            reason=pb.CONFIGURATION_UPDATE_REASON_INITIAL_SNAPSHOT,
            configuration=static_configuration(),
        )
        while context.is_active():
            time.sleep(self._watch_interval_seconds)

    def ReportRouterEvents(self, request_iterator: Any, context: grpc.ServicerContext) -> Any:
        count = 0
        for event in request_iterator:
            count += 1
            log_message("ReportRouterEvents", event)
        return pb.ReportRouterEventsResponse(accepted_events=count)


def serve(address: str, watch_interval_seconds: float) -> None:
    configuration = static_configuration()
    print_peer_configs(configuration)

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    pb_grpc.add_RouterControlPlaneServicer_to_server(
        RouterControlPlaneMock(watch_interval_seconds),
        server,
    )
    server.add_insecure_port(address)
    server.start()
    logging.info("mock control plane listening on %s revision=%s", address, REVISION)
    server.wait_for_termination()


def main() -> None:
    parser = argparse.ArgumentParser(description="Static gRPC RouterControlPlane mock")
    parser.add_argument("--address", default="127.0.0.1:50051")
    parser.add_argument("--watch-interval-seconds", type=float, default=3600.0)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    serve(args.address, args.watch_interval_seconds)


if __name__ == "__main__":
    main()
