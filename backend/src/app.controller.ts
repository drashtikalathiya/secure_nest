import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('health')
  getHealth() {
    return {
      ok: true,
      service: 'secure-nest-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
