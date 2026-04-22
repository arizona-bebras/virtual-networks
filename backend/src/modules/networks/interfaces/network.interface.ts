import { ApiProperty } from "@nestjs/swagger";

export class Network {
  @ApiProperty({ description: "Название сети", example: "Production Network" })
  name!: string;

  @ApiProperty({
    description: "Описание сети",
    example: "Main production environment",
  })
  description!: string;

  @ApiProperty({ description: "IP адрес сети", example: "10.0.0.0/24" })
  ip!: string;

  @ApiProperty({ description: ".conf файл", example: "[Interface]..." })
  config!: string;
}

export class EnterCredentials {
  @ApiProperty({
    description: "Ключ дял подключения к сети",
    example: "wgpvt_abc123xyz...",
  })
  key!: string;
}
