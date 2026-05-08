import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { CreateRuleDto } from "common/dto/rule/create-rule";
import { RuleDto } from "common/dto/rule/index";
import { UpdateRuleDto } from "common/dto/rule/update-rule";
import { Role } from "../../authorization/role.enum";
import { Roles } from "../../authorization/roles.decorator";
import { RolesGuard } from "../../authorization/roles.guard";
import { RulesService } from "./rules.service";

@ApiTags("Rules")
@Controller("networks/:network_id/rules")
@UseGuards(AuthGuard, RolesGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Создать новое правило" })
  @ApiBody({ type: CreateRuleDto })
  @ApiResponse({ status: 201, description: "Правило успешно создано" })
  async create(
    @Param("network_id") network_id: string,
    @Body() rule: CreateRuleDto,
  ) {
    await this.rulesService.create(rule, network_id);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiQuery({
    name: "q",
    description: "Поисковой запрос по названию правила",
    required: false,
  })
  @ApiQuery({
    name: "source_tags",
    description:
      "ID тегов, отправляющих данные, по которым происходит фильтрация",
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: "dest_tags",
    description:
      "ID тегов, принимающих данные, по которым происходит фильтрация",
    required: false,
    isArray: true,
  })
  @ApiOperation({ summary: "Получить правила сети" })
  @ApiResponse({
    status: 200,
    description: "Правила получены",
    type: RuleDto,
    isArray: true,
  })
  async getAllRules(
    @Param("network_id") networkId: string,
    @Query("q") q: string,
    @Query("source_tags") sourceTags: string[],
    @Query("dest_tags") destTags: string[],
  ): Promise<RuleDto[]> {
    return await this.rulesService.getRules(networkId, q, sourceTags, destTags);
  }

  @Get(":rule_id")
  @ApiOperation({ summary: "Получить правило по ID" })
  @ApiParam({
    name: "rule_id",
    description: "UUID правила",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Правило найдено", type: RuleDto })
  @ApiResponse({ status: 404, description: "Правило не найдено" })
  async get(@Param("rule_id") rule_id: string): Promise<RuleDto | undefined> {
    return await this.rulesService.get(rule_id);
  }

  @Put(":rule_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Обновить правило по ID" })
  @ApiParam({
    name: "rule_id",
    description: "UUID правила",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiBody({ type: UpdateRuleDto })
  @ApiResponse({ status: 200, description: "Правило успешно обновлено" })
  @ApiResponse({ status: 404, description: "Правило не найдено" })
  async update(@Param("rule_id") rule_id: string, @Body() rule: UpdateRuleDto) {
    await this.rulesService.update(rule_id, rule);
  }

  @Delete(":rule_id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Удалить правило по ID" })
  @ApiParam({
    name: "rule_id",
    description: "UUID правила",
    example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  })
  @ApiResponse({ status: 200, description: "Правило успешно удалено" })
  @ApiResponse({ status: 404, description: "Правило не найдено" })
  async delete(@Param("rule_id") rule_id: string) {
    await this.rulesService.delete(rule_id);
  }
}
