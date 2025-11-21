import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { User } from './entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
=======
import { User } from './entities/user.entity';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vendor])],
>>>>>>> main
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
