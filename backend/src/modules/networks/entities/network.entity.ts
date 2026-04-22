import { ApiProperty } from "@nestjs/swagger";

export class NetworkEntity {
  @ApiProperty({ description: "Название VPN сети", example: "Office Network" })
  name!: string;

  @ApiProperty({
    description: "Описание сети",
    example: "Main office VPN network",
  })
  description!: string;

  @ApiProperty({ description: "IP адрес сети", example: "192.168.1.0/24" })
  ip!: string;

  @ApiProperty({
    description: "Содержимое конфигурационного файла (.conf)",
    example: "proto udp\nport 1194\n...",
  })
  config!: string;
}
