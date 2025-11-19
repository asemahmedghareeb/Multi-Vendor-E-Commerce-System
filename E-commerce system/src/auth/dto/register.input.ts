import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../common/enums/roles.enum';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field(() => UserRole, { nullable: true, defaultValue: UserRole.CLIENT })
  @IsOptional()
  role?: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}
