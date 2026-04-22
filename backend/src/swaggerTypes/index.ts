import { ApiProperty } from "@nestjs/swagger";

export class Network {
  @ApiProperty({
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  id!: string;

  @ApiProperty({ description: "Название VPN сети", example: "Office Network" })
  name!: string;

  @ApiProperty({
    description: "Описание сети",
    example: "Main office VPN network",
  })
  description!: string;

  @ApiProperty({ description: "IP адрес сети", example: "192.168.1.0" })
  ip!: string;

  @ApiProperty({
    description: "Размер подсети (CIDR)",
    example: 24,
    minimum: 0,
    maximum: 32,
  })
  subnet!: number;

  @ApiProperty({
    description: "Содержимое конфигурационного файла (.conf)",
    example: "proto udp\nport 1194\n...",
  })
  config!: string;
}

export class Device {
  @ApiProperty({
    description: "UUID устройства",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  id!: string;

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
    description: "UUID сети, к которой подключается устройство",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  network_id!: string;
}

export class Rule {
  @ApiProperty({
    description: "ID тега устройства отправителя",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  source!: string;

  @ApiProperty({
    description: "ID тега устройства получатеся",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  dest!: string;

  @ApiProperty({
    description:
      "Протокол (При отсутсвтии прямого указания протокола, применяется ко всем(ANY))",
    example: "TCP",
  })
  protocol!: string;

  @ApiProperty({
    description:
      "Порт (При отсутсвтии прямого указания порта, применяется ко всем(ALL)",
    example: 443,
    minimum: 0,
    maximum: 65535,
  })
  port!: number;

  @ApiProperty({
    description: "UUID сети, к которой относится правило",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  network_id!: string;
}

export class Tag {
  @ApiProperty({ description: "Название тега", example: "Office" })
  name!: string;

  @ApiProperty({
    description: "UUID сети",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  network_id!: string;
}

export class NetworkEnterCredentials {
  @ApiProperty({
    description: "Ключ для подключения к сети",
    example: "2gW0ceanyvOMhhscLY+svQ==",
  })
  key!: string;
}
