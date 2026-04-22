import { ApiProperty } from "@nestjs/swagger";

export class DeviceEntity {
  @ApiProperty({ description: "Название устройства", example: "Office-PC-01" })
  name!: string;

  @ApiProperty({
    description: "IP адрес устройства в сети",
    example: "192.168.1.10",
  })
  ip!: string;

  @ApiProperty({
    description: "Содержимое конфигурационного файла устройства (.conf)",
    example: "client\nremote vpn.example.com 1194\n...",
  })
  config!: string;

  @ApiProperty({
    description: "UUID Владельца устройства",
    example: "14881488-1488-1488-1488-148814881488",
  })
  ownerId!: string;
}
