import { ApiProperty } from "@nestjs/swagger";

export class RuleEntity {
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
    required: false,
  })
  protocol!: string;

  @ApiProperty({
    description:
      "Порт (При отсутсвтии прямого указания порта, применяется ко всем(ALL)",
    example: 443,
    minimum: 0,
    maximum: 65535,
    required: false,
  })
  port!: number;
}
