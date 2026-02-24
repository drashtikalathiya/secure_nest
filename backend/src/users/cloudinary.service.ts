import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class CloudinaryService {
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  private readonly apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  private readonly apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  async uploadProfilePhoto(
    file: { buffer: Buffer; mimetype: string },
    profileKey: string,
  ): Promise<string> {
    this.ensureConfigured();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = this.getProfilePublicId(profileKey);
    const paramsToSign = `invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = this.sign(paramsToSign);

    const formData = new FormData();
    const bytes = new Uint8Array(file.buffer);
    formData.append('file', new Blob([bytes], { type: file.mimetype }));
    formData.append('public_id', publicId);
    formData.append('overwrite', 'true');
    formData.append('invalidate', 'true');
    formData.append('api_key', this.apiKey!);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok || !data?.secure_url) {
      throw new InternalServerErrorException(
        data?.error?.message || 'Failed to upload profile photo to Cloudinary.',
      );
    }

    return data.secure_url as string;
  }

  async uploadDocument(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }, publicId: string): Promise<{
    url: string;
    publicId: string;
    resourceType: string;
    bytes: number;
    originalFilename?: string;
    format?: string;
  }> {
    this.ensureConfigured();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = this.sign(paramsToSign);

    const formData = new FormData();
    const bytes = new Uint8Array(file.buffer);
    formData.append('file', new Blob([bytes], { type: file.mimetype }));
    formData.append('public_id', publicId);
    formData.append('api_key', this.apiKey!);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok || !data?.secure_url || !data?.public_id) {
      throw new InternalServerErrorException(
        data?.error?.message || 'Failed to upload document to Cloudinary.',
      );
    }

    return {
      url: data.secure_url as string,
      publicId: data.public_id as string,
      resourceType: data.resource_type as string,
      bytes: typeof data.bytes === 'number' ? data.bytes : 0,
      originalFilename: data.original_filename as string | undefined,
      format: data.format as string | undefined,
    };
  }

  async deleteProfilePhotoByKey(profileKey: string): Promise<void> {
    this.ensureConfigured();

    await this.destroyImage(this.getProfilePublicId(profileKey));
  }

  async deleteByUrl(photoUrl?: string | null): Promise<void> {
    this.ensureConfigured();

    const publicId = this.extractPublicIdFromCloudinaryUrl(photoUrl || '');
    if (!publicId) return;

    await this.destroyImage(publicId);
  }

  async deleteAsset(publicId: string, resourceType: string): Promise<void> {
    this.ensureConfigured();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = this.sign(paramsToSign);

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp,
      api_key: this.apiKey!,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new InternalServerErrorException(
        data?.error?.message || 'Failed to delete file from Cloudinary.',
      );
    }
  }

  private async destroyImage(publicId: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = this.sign(paramsToSign);

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp,
      api_key: this.apiKey!,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new InternalServerErrorException(
        data?.error?.message || 'Failed to delete image from Cloudinary.',
      );
    }
  }

  private getProfilePublicId(profileKey: string): string {
    return `secureNest/profile-photo/${profileKey}`;
  }

  private extractPublicIdFromCloudinaryUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('res.cloudinary.com')) return null;

      const segments = parsed.pathname.split('/').filter(Boolean);
      const uploadIndex = segments.findIndex((segment) => segment === 'upload');
      if (uploadIndex === -1 || uploadIndex + 1 >= segments.length) return null;

      const afterUpload = segments.slice(uploadIndex + 1);
      const withoutTransforms =
        afterUpload[0]?.startsWith('v') && /^v\d+$/.test(afterUpload[0])
          ? afterUpload.slice(1)
          : afterUpload;

      if (!withoutTransforms.length) return null;

      const joined = withoutTransforms.join('/');
      return joined.replace(/\.[^/.]+$/, '') || null;
    } catch {
      return null;
    }
  }

  private sign(payload: string): string {
    return createHash('sha1')
      .update(`${payload}${this.apiSecret}`)
      .digest('hex');
  }

  private ensureConfigured() {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new UnauthorizedException(
        'Cloudinary is not configured on the server. Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.',
      );
    }
  }
}
