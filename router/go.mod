module router

go 1.25.5

require (
	golang.org/x/crypto v0.49.0
	golang.zx2c4.com/wireguard v0.0.0-20250521234502-f333402bd9cb
	gvisor.dev/gvisor v0.0.0-20250503011706-39ed1f5ac29c
)

require (
	github.com/google/btree v1.1.3 // indirect
	golang.org/x/net v0.52.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/time v0.15.0 // indirect
	golang.zx2c4.com/wintun v0.0.0-20230126152724-0fa3db229ce2 // indirect
)

replace proto => ../proto
