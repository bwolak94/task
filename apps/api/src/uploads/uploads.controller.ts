import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PresignUploadDto } from './dto/presign-upload.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async presignUpload(@Body() dto: PresignUploadDto) {
    return this.uploadsService.generatePresignUrl(dto);
  }
}
