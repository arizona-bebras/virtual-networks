package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/netip"
	"strings"

	"golang.org/x/crypto/curve25519"
)

func generatePeers(cfg serverConfig) ([]peer, error) {
	networkBase := cfg.OverlayCIDR.Addr().As4()
	serverIP := cfg.ServerAddr.As4()

	nextHost := 2
	peers := make([]peer, 0, cfg.PeerCount)
	for len(peers) < cfg.PeerCount {
		candidate := netip.AddrFrom4([4]byte{networkBase[0], networkBase[1], networkBase[2], byte(nextHost)})
		nextHost++

		if !cfg.OverlayCIDR.Contains(candidate) {
			return nil, fmt.Errorf("overlay %s does not have enough addresses for %d peers", cfg.OverlayCIDR, cfg.PeerCount)
		}
		if candidate == cfg.ServerAddr || candidate.As4() == serverIP {
			continue
		}

		identity, err := generateIdentity()
		if err != nil {
			return nil, err
		}
		peers = append(peers, peer{
			Name:     fmt.Sprintf("peer-%d", len(peers)+1),
			Identity: identity,
			Addr:     candidate,
		})
	}

	return peers, nil
}

func generateIdentity() (wireGuardIdentity, error) {
	var private [32]byte
	if _, err := rand.Read(private[:]); err != nil {
		return wireGuardIdentity{}, err
	}

	private[0] &= 248
	private[31] &= 127
	private[31] |= 64

	publicKey, err := curve25519.X25519(private[:], curve25519.Basepoint)
	if err != nil {
		return wireGuardIdentity{}, err
	}

	var public [32]byte
	copy(public[:], publicKey)

	return wireGuardIdentity{
		Private: private,
		Public:  public,
	}, nil
}

func renderServerIPC(cfg serverConfig, serverID wireGuardIdentity, peers []peer) string {
	var b strings.Builder
	fmt.Fprintf(&b, "private_key=%s\n", hex.EncodeToString(serverID.Private[:]))
	fmt.Fprintf(&b, "listen_port=%d\n", cfg.ListenPort)
	b.WriteString("replace_peers=true\n")

	for _, p := range peers {
		fmt.Fprintf(&b, "public_key=%s\n", hex.EncodeToString(p.Identity.Public[:]))
		fmt.Fprintf(&b, "allowed_ip=%s/32\n", p.Addr)
	}

	return b.String()
}

func renderPeerConfig(cfg serverConfig, endpoint string, serverID wireGuardIdentity, p peer) string {
	return fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = %s

[Peer]
PublicKey = %s
AllowedIPs = %s
Endpoint = %s
PersistentKeepalive = %d`,
		encodeBase64(p.Identity.Private[:]),
		p.Addr,
		cfg.ServerAddr,
		encodeBase64(serverID.Public[:]),
		cfg.OverlayCIDR,
		endpoint,
		cfg.KeepaliveSec,
	)
}

func encodeBase64(key []byte) string {
	return base64.StdEncoding.EncodeToString(key)
}
