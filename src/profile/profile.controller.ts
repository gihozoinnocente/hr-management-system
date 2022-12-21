import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { getGenericResponseSchema } from 'src/shared/util/swagger.util';
import { Profile } from './entities/profile.entity';
import { GenericResponse } from 'src/shared/interface/generic-response.interface';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiExtraModels(Profile)
  @ApiConflictResponse({ description: 'Profile created successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  @Post('/createprofile/:id')
  async create(@Body() createProfileDto: CreateProfileDto) {
    const result = await this.profileService.create(createProfileDto);
    return {
      message: 'Profile created successfully',
      results: { ...result },
    };
  }

  @Get()
  async findAll() {
    const result = await this.profileService.findAll();
    return {
      message: 'User Profile Retrieved succssfully',
      results: { ...result },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.profileService.findOne(+id);
    return {
      message: 'User Profile Retrieved successfully',
      results: { ...result },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const result = await this.profileService.update(+id, updateProfileDto);
    return {
      message: 'User Profile Updated successfully',
      results: { ...result },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.profileService.remove(+id);
    return {
      message: 'User Profile deleted successfully',
    };
  }
}
