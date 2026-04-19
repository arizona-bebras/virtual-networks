package runtimeutil

import (
	"fmt"
	"net/netip"
)

func AllocateClientAddrs(
	clientSubnet netip.Prefix,
	serverAddr netip.Addr,
	clientCount int,
	nextHost int,
) ([]netip.Addr, int, error) {
	if nextHost == 0 {
		nextHost = 2
	}

	clientAddrs := make([]netip.Addr, 0, clientCount)
	networkBase := clientSubnet.Addr().As4()

	for len(clientAddrs) < clientCount {
		candidate := netip.AddrFrom4([4]byte{networkBase[0], networkBase[1], networkBase[2], byte(nextHost)})
		nextHost++

		if !clientSubnet.Contains(candidate) {
			return nil, 0, fmt.Errorf("subnet %s does not have enough addresses for configured protocol clients", clientSubnet)
		}
		if clientSubnet.Contains(serverAddr) && candidate == serverAddr {
			continue
		}

		clientAddrs = append(clientAddrs, candidate)
	}

	return clientAddrs, nextHost, nil
}
