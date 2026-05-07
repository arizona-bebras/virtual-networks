module router

go 1.25.5

require (
	golang.org/x/crypto v0.49.0
	golang.zx2c4.com/wireguard v0.0.0-20250521234502-f333402bd9cb
	google.golang.org/grpc v1.80.0
	gvisor.dev/gvisor v0.0.0-20250503011706-39ed1f5ac29c
	proto v0.0.0-00010101000000-000000000000
)

require (
	github.com/google/btree v1.1.3 // indirect
	golang.org/x/net v0.52.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/text v0.35.0 // indirect
	golang.org/x/time v0.15.0 // indirect
	golang.zx2c4.com/wintun v0.0.0-20230126152724-0fa3db229ce2 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260401024825-9d38bb4040a9 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace proto => ../proto
