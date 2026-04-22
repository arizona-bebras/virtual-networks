import { ApiProperty } from "@nestjs/swagger";

export class Rule {
  @ApiProperty({
    description: "ID тега источника",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  source!: string;

  @ApiProperty({
    description: "ID тега назначения",
    example: "b1ffccd0-0d1c-5fg9-cc7e-7cc0ce491b22",
  })
  dest!: string;

  @ApiProperty({ description: "Протокол (TCP/UDP)", example: "TCP" })
  protocol!: string;

  @ApiProperty({ description: "Порт", example: 443 })
  port!: number;
}
