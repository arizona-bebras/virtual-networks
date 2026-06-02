package wireguard

import (
	"encoding/hex"
	"net/netip"
	"strings"
	"testing"

	router "router"
)

func TestRenderServerUpdateIPCPreservesExistingPeers(t *testing.T) {
	peerPublic := keyWithByte(3)

	previousPeers := []peer{{
		ID:       "device-1",
		Identity: router.WireGuardIdentity{Public: peerPublic},
		Addr:     netip.MustParseAddr("10.44.0.2"),
	}}
	nextPeers := []peer{{
		ID:       "device-1",
		Identity: router.WireGuardIdentity{Public: peerPublic},
		Addr:     netip.MustParseAddr("10.44.0.22"),
	}}

	ipc := renderServerUpdateIPC(previousPeers, nextPeers)

	if strings.Contains(ipc, "replace_peers=true") {
		t.Fatalf("live update IPC replaced all peers:\n%s", ipc)
	}
	if strings.Contains(ipc, "private_key=") || strings.Contains(ipc, "listen_port=") {
		t.Fatalf("live update IPC rewrote interface settings:\n%s", ipc)
	}
	if strings.Contains(ipc, "remove=true") {
		t.Fatalf("live update IPC removed unchanged peer:\n%s", ipc)
	}
	if strings.Contains(ipc, "preshared_key=") {
		t.Fatalf("live update IPC rewrote unchanged preshared key:\n%s", ipc)
	}
	if !strings.Contains(ipc, "replace_allowed_ips=true\nallowed_ip=10.44.0.22/32\n") {
		t.Fatalf("live update IPC did not replace allowed IPs:\n%s", ipc)
	}
}

func TestRenderServerUpdateIPCRemovesDeletedAndRekeyedPeers(t *testing.T) {
	oldPublic := keyWithByte(3)
	newPublic := keyWithByte(4)
	deletedPublic := keyWithByte(5)

	previousPeers := []peer{
		{ID: "device-1", Identity: router.WireGuardIdentity{Public: oldPublic}, Addr: netip.MustParseAddr("10.44.0.2")},
		{ID: "device-2", Identity: router.WireGuardIdentity{Public: deletedPublic}, Addr: netip.MustParseAddr("10.44.0.3")},
	}
	nextPeers := []peer{{
		ID:       "device-1",
		Identity: router.WireGuardIdentity{Public: newPublic},
		Addr:     netip.MustParseAddr("10.44.0.2"),
	}}

	ipc := renderServerUpdateIPC(previousPeers, nextPeers)

	for _, publicKey := range [][32]byte{oldPublic, deletedPublic} {
		removeBlock := "public_key=" + hex.EncodeToString(publicKey[:]) + "\nremove=true\n"
		if !strings.Contains(ipc, removeBlock) {
			t.Fatalf("live update IPC missing remove block %q:\n%s", removeBlock, ipc)
		}
	}
	if !strings.Contains(ipc, "public_key="+hex.EncodeToString(newPublic[:])+"\n") {
		t.Fatalf("live update IPC missing rekeyed peer:\n%s", ipc)
	}
}

func TestRenderServerUpdateIPCSkipsUnchangedPeers(t *testing.T) {
	peerPublic := keyWithByte(3)
	previousPeers := []peer{{
		ID:       "device-1",
		Identity: router.WireGuardIdentity{Public: peerPublic},
		Addr:     netip.MustParseAddr("10.44.0.2"),
	}}
	nextPeers := []peer{{
		ID:       "device-1",
		Identity: router.WireGuardIdentity{Public: peerPublic},
		Addr:     netip.MustParseAddr("10.44.0.2"),
	}}

	if ipc := renderServerUpdateIPC(previousPeers, nextPeers); ipc != "" {
		t.Fatalf("unchanged peers produced live update IPC:\n%s", ipc)
	}
}

func keyWithByte(value byte) [32]byte {
	var key [32]byte
	for i := range key {
		key[i] = value
	}
	return key
}
