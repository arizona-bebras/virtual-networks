import { ApiProperty } from "@nestjs/swagger";

export enum Color {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Purple = "purple",
  Orande = "orange",
}

export class TagEntity {
  @ApiProperty({ description: "Название тега", example: "Office" })
  name!: string;

  @ApiProperty({ description: "Цвет тега", example: "red" })
  color!: Color;
}
