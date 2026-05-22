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
  const octets = ip.split(".") as [string, string, string, string];
  if (params.changeArea === "ip") {
    for (const [index, octetNum] of params.octetNumbers.entries()) {
      octets[octetNum - 1] = params.newValues[index]!;
    }
  }
  return `${octets.join(".")}/${mask}`;
}

export function splitCidr(cidr: string): { ip: string; mask: string } {
  const [ip, mask] = cidr.split("/") as [string, string];
  return { ip, mask };
}
