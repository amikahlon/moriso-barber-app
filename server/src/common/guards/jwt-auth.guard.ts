// שומר בסיסי — בודק שיש JWT token תקין בכותרת הבקשה.
//  כל endpoint שמוגן יקבל את זה. אם אין token או שהוא לא תקין — מחזיר 401.

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
