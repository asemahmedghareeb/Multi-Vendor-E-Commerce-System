import { Global, Module, Scope } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserLoader } from './user.loader';

@Global()
@Module({
  imports: [
    AuthModule,
  ],
  providers: [
    { provide: UserLoader, useClass: UserLoader, scope: Scope.REQUEST },
  ],
  exports: [
    UserLoader,
  ],
})
export class DataLoadersModule {}
