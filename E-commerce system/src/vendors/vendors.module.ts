import { Module } from '@nestjs/common';
import { UsersService } from './vendors.service';
import { UsersResolver } from './vendors.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vendor])],
  providers: [UsersResolver, UsersService],
})
export class vendorsModule {}
