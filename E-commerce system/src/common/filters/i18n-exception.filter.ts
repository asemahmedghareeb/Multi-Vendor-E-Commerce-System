import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nExceptionFilter implements GqlExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();

    const lang = ctx.req?.i18nLang || 'en';

    const response = exception.getResponse();
    const status = exception.getStatus();

    let message = exception.message;
    let args = {};

    if (typeof response === 'object' && (response as any).key) {
      message = (response as any).key;
      args = (response as any).args || {};
    }

    let translated = message;
    try {
      translated = await this.i18n.translate(message, { lang, args });
    } catch (e) {}

    return new HttpException(translated, status);
  }
}
