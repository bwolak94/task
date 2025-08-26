import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {}

  async generatePresignUrl(dto: PresignUploadDto) {
    const { tenantId, filename, contentType, size } = dto;
    
    // Generate unique storage key
    const orderId = `ord_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
    const storageKey = `tenants/${tenantId}/orders/${orderId}/${filename}`;
    
    // Mock presign URL (in real implementation, this would use AWS SDK)
    const mockUrl = `http://localhost:9000/upload?key=${storageKey}&expires=${Date.now() + 120000}`;
    
    return {
      url: mockUrl,
      storageKey,
      expiresInSeconds: 120,
      headers: {
        'Content-Type': contentType,
      },
    };
  }
}
