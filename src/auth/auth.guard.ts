import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validApiKey =
      this.configService.get<string>('API_KEY') || 'second-to-top-secret-label';

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authHeader;
  }
}
