import { ApiProperty } from "@nestjs/swagger";

export class Device {
  @ApiProperty({ description: "Название устройства", example: "My Laptop" })
  name!: string;

  @ApiProperty({ description: "IP адрес устройства", example: "192.168.1.100" })
  ip!: string;

  @ApiProperty({ description: ".conf файл", example: "[Interface]..." })
  config!: string;

  @ApiProperty({ description: "ID владельца (user.id)", example: "usr_abc123" })
  ownerId!: string;
}
