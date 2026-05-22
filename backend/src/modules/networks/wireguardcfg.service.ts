import { Inject, Injectable } from "@nestjs/common";
import { NetworkCfgDto } from "common/dto/network/network-cfg";
import { Address4 } from "ip-address";
import * as QRCode from "qrcode";
import { type Database, DRIZZLE } from "../../db/database.module.js";

@Injectable()
export class WireguardCfgService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async genServerCfg(networkId: string): Promise<NetworkCfgDto> {
    const network = await this.db.query.networks.findFirst({
      where: {
        id: networkId,
      },
      with: {
        devices: {
          with: {
            keys: true,
          },
        },
        keys: true,
      },
    });

    const configData = [
      `[Interface]`,
      `PrivateKey = ${network?.keys?.privateKey?.toString("base64")}`,
      ``,
      `Addres = ${network?.cidr}`,
      `DNS = 8.8.8.8`,
      `MTU = 1420`,
      ``,
    ];

    for (const device of network?.devices ?? []) {
      configData.push(
        `[Peer]`,
        `PublicKey = ${device?.keys?.publicKey?.toString("base64")}`,
        ``,
        `AllowedIps = ${network?.cidr}`,
        ``,
      );
    }

    const configDataStr = configData.join("\n");

    const qrCodeDataUrl = await QRCode.toDataURL(configDataStr, {
      errorCorrectionLevel: "M",
      margin: 2,
    });

    return {
      name: `${network?.name}.conf`,
      config: configDataStr,
      qrCode: qrCodeDataUrl,
    };
  }
}
