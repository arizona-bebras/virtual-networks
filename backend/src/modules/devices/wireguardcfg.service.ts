import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DeviceCfgDto } from "common/dto/device/device-cfg";
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
      ``,
      `[Peer]`,
      `PublicKey = ${device?.network?.keys?.publicKey?.toString("base64")}`,
      `AllowedIps = ${device?.network?.cidr}`,
      `Endpoint = ${process.env.WIREGUARD_ENDPOINT}`,
    ].join("\n");

    const qrCodeDataUrl = await QRCode.toDataURL(configData, {
      errorCorrectionLevel: "M",
      margin: 2,
    });

    return {
      name: `${device?.name}.conf`,
      config: configData,
      clientPublicKey: device?.keys?.publicKey?.toString("base64") ?? "",
      qrCode: qrCodeDataUrl,
    };
  }
}
