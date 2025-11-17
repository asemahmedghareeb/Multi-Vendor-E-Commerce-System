import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsUUID, IsIn } from 'class-validator';

@InputType()
export class RegisterStaffInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @Field(() => String, {
    description: "User's top-level role: 'Admin' or 'Staff'",
  })
  @IsIn(['Admin', 'Staff'])
  userRole: 'Admin' | 'Staff';

  @Field()
  @IsNotEmpty()
  employeeId: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ description: "Staff's job role: 'Pilot', 'Crew', 'Security', etc." })
  @IsNotEmpty()
  staffRole: string;

  @Field(() => ID)
  @IsUUID()
  airportId: string;
}
