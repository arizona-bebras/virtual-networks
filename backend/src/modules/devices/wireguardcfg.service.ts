import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DeviceCfgDto } from "common/dto/device/device-cfg";
import { Address4 } from "ip-address";
import * as QRCode from "qrcode";
import { type Database, DRIZZLE } from "../../db/database.module.js";

@Injectable()
export class WireguardCfgService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async genClientCfg(deviceId: string): Promise<DeviceCfgDto> {
    const device = await this.db.query.devices.findFirst({
      where: {
        id: deviceId,
      },
      with: {
        network: {
          with: {
            keys: true,
          },
        },
        keys: true,
      },
    });

    if (!device) {
      throw new NotFoundException("Device not found");
    }

    const configData = [
      `[Interface]`,
      `PrivateKey = ${device?.keys?.privateKey?.toString("base64")}`,
      `Address = ${device?.ip}`,
      `DNS = ${new Address4(device?.network?.cidr ?? "")
        .startAddressExclusive()
        .correctForm()}`,
      ``,
      `[Peer]`,
      `PublicKey = ${device?.network?.keys?.publicKey?.toString("base64")}`,
      `AllowedIPs = ${device?.network?.cidr}`,
      `Endpoint = ${process.env.WIREGUARD_ENDPOINT}`,
      `PersistentKeepalive = 25`,
      ``,
    ].join("\n");

    const qrCodeDataUrl = await QRCode.toDataURL(configData, {
      errorCorrectionLevel: "M",
      margin: 2,
    });

    const filename = device?.slug
      .replaceAll(/[^a-zA-Z0-9_.-]/g, "")
      .substring(0, 10);

    return {
      name: `${filename ?? "config"}.conf`,
      config: configData,
      clientPublicKey: device?.keys?.publicKey?.toString("base64") ?? "",
      qrCode: qrCodeDataUrl,
    };
  }
}
