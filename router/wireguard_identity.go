package router

import (
	"crypto/rand"

	"golang.org/x/crypto/curve25519"
)

type WireGuardIdentity struct {
	Private [32]byte
	Public  [32]byte
}

func GenerateWireGuardIdentity() (WireGuardIdentity, error) {
	var private [32]byte
	if _, err := rand.Read(private[:]); err != nil {
		return WireGuardIdentity{}, err
	}

	private[0] &= 248
	private[31] &= 127
	private[31] |= 64

	publicKey, err := curve25519.X25519(private[:], curve25519.Basepoint)
	if err != nil {
		return WireGuardIdentity{}, err
	}

	var public [32]byte
	copy(public[:], publicKey)

	return WireGuardIdentity{
		Private: private,
		Public:  public,
	}, nil
}
