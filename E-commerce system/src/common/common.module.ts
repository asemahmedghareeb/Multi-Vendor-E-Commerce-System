import { Global, Module } from '@nestjs/common';
import { I18nExceptionFilter } from './filters/i18n-exception.filter';
@Global()
@Module({})
export class CommonModule {}
