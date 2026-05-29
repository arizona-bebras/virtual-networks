import type { ValidationResult } from "../../features/config/model/types";

type changeCidrParams = cidrIp | cidrMask;

type cidrIp = {
  changeArea: "ip";
  octetNumbers: number[];
  newValues: string[];
};
type cidrMask = {
  changeArea: "mask";
  newValue: string;
};

export const ipToLong = (ip: string) =>
  ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + (parseInt(octet, 10) || 0), 0) >>> 0;

export const intToIp = (int: number) =>
  [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(
    ".",
  );

export function changeCidrValue(
  cidr: string,
  params: changeCidrParams,
): string {
  const { ip, mask } = splitCidr(cidr);
  const octets = ip.split(".") as [string, string, string, string];
  if (params.changeArea === "ip") {
    for (const [index, octetNum] of params.octetNumbers.entries()) {
      octets[octetNum - 1] = params.newValues[index]!;
    }
    return `${octets.join(".")}/${mask}`;
  } else {
    return `${octets.join(".")}/${params.newValue}`;
  }
}

export function splitCidr(cidr: string): { ip: string; mask: string } {
  const [ip, mask] = cidr.split("/") as [string, string];
  return { ip: ip || "0.0.0.0", mask: mask || "32" };
}

export function validateNetworkCidr(cidr: string): ValidationResult {
  const { ip, mask: maskStr } = splitCidr(cidr);
  const mask = parseInt(maskStr, 10);
  const octets = ip.split(".").map(Number);

  const ipInt = ipToLong(ip);
  const subnetMask = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;

  const networkInt = (ipInt & subnetMask) >>> 0;
  const totalIps = 2 ** (32 - mask);
  const isNetworkValid = ipInt === networkInt;

  if (isNetworkValid) {
    let firstHostInt: number, lastHostInt: number;

    if (mask === 32) {
      firstHostInt = networkInt;
      lastHostInt = networkInt;
    } else if (mask === 31) {
      firstHostInt = networkInt;
      lastHostInt = networkInt + totalIps - 1;
    } else {
      firstHostInt = networkInt + 1;
      lastHostInt = networkInt + totalIps - 2;
    }

    return {
      isValid: true,
      hostCount: totalIps,
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
    };
  } else {
    const netOctets = intToIp(networkInt).split(".").map(Number);
    const hostOctets = octets;

    let octetIndex = 3;
    for (let i = 0; i < 4; i++) {
      if (hostOctets[i] !== netOctets[i]) {
        octetIndex = i;
        break;
      }
    }
    const bitsInOctet = Math.max(0, Math.min(8, mask - octetIndex * 8));
    const step = 2 ** (8 - bitsInOctet);

    const currentNetValue = netOctets[octetIndex] ?? 0;
    const lowerSuggestion = currentNetValue;
    const upperSuggestion =
      currentNetValue + step >= 255 ? -1 : currentNetValue + step;

    return {
      isValid: false,
      error: {
        octetIndex: octetIndex + 1,
        suggestion: {
          lower: lowerSuggestion,
          upper: upperSuggestion,
        },
      },
    };
  }
}

export function validateHostIP(
  hostIp: string,
  networkCidr: string,
): ValidationResult {
  const { ip: netIp, mask: maskStr } = splitCidr(networkCidr);
  const mask = parseInt(maskStr, 10) || 0;

  const ipInt = ipToLong(hostIp);
  const netInt = ipToLong(netIp);

  const subnetMask = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;

  const networkBase = (netInt & subnetMask) >>> 0;
  const ipNetwork = (ipInt & subnetMask) >>> 0;

  const totalIps = 2 ** (32 - mask);
  const broadcastInt =
    mask === 0 ? 0xffffffff : (networkBase + totalIps - 1) >>> 0;

  const isSameNetwork = networkBase === ipNetwork;

  const routerIpInt = mask >= 31 ? networkBase : networkBase + 1;
  const firstAvailableHostInt = mask >= 31 ? networkBase : networkBase + 2;

  let isValid = false;
  if (isSameNetwork) {
    if (mask >= 31) {
      isValid = true;
    } else {
      isValid = ipInt > routerIpInt && ipInt < broadcastInt;
    }
  }

  const firstHostInt = firstAvailableHostInt;
  const lastHostInt = mask >= 31 ? broadcastInt : broadcastInt - 1;

  if (isValid) {
    return {
      isValid: true,
      hostCount: mask === 32 ? 1 : mask === 31 ? 2 : Math.max(0, totalIps - 3),
      firstHost: intToIp(firstHostInt),
      lastHost: intToIp(lastHostInt),
    };
  } else {
    const hostOctets = hostIp.split(".").map((o) => parseInt(o, 10) || 0);
    const firstHostOctets = intToIp(firstHostInt).split(".").map(Number);
    const lastHostOctets = intToIp(lastHostInt).split(".").map(Number);

    let octetIndex = 0;

    for (let i = 0; i < 4; i++) {
      const h = hostOctets[i] ?? 0;
      const f = firstHostOctets[i] ?? 0;
      const l = lastHostOctets[i] ?? 255;
      if (h < f || h > l) {
        octetIndex = i;
        break;
      }
    }

    return {
      isValid: false,
      error: {
        octetIndex: octetIndex + 1,
        suggestion: {
          lower: firstHostOctets[octetIndex] ?? 0,
          upper: lastHostOctets[octetIndex] ?? 255,
        },
      },
    };
  }
}
