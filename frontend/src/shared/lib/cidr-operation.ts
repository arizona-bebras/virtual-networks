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

export function changeCidrValue(
  cidr: string,
  params: changeCidrParams,
): string {
  const { ip, mask } = splitCidr(cidr);
  if (params.changeArea === "ip") {
    const octets = ip.split(".") as [string, string, string, string];
    for (const [index, octetNum] of params.octetNumbers.entries()) {
      octets[octetNum - 1] = params.newValues[index]!;
    }
    return `${octets.join(".")}/${mask}`;
  } else {
    return cidr.slice(0, -2) + params.newValue;
  }
}

export function splitCidr(cidr: string): { ip: string; mask: string } {
  const [ip, mask] = cidr.split("/") as [string, string];
  return { ip, mask };
}
