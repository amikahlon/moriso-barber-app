import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard, RolesGuard, Roles, ParseUuidPipe } from '../common';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'כל השירותים' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.servicesService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'שירות לפי ID' })
  findOne(@Param('id', ParseUuidPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'יצירת שירות חדש — אדמין בלבד' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'עדכון שירות — אדמין בלבד' })
  update(
    @Param('id', ParseUuidPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'מחיקת שירות — אדמין בלבד' })
  remove(@Param('id', ParseUuidPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
