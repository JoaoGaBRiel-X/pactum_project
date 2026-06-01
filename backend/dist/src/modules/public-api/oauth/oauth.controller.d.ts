import { OAuthService } from './oauth.service';
import { TokenRequestDto } from './dto/token-request.dto';
export declare class OAuthController {
    private readonly oauthService;
    constructor(oauthService: OAuthService);
    getToken(dto: TokenRequestDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
}
