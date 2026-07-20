import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tipster } from '@prisma/client';

export const CurrentTipster = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Tipster => {
    const request = ctx.switchToHttp().getRequest<{ tipster: Tipster }>();
    return request.tipster;
  },
);
