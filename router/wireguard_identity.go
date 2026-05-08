package router

type WireGuardIdentity struct {
	Private [32]byte
	Public  [32]byte
}
