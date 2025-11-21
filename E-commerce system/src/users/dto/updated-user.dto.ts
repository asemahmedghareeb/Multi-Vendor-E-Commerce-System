import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, MinLength, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  // Using the 'validation.MIN' key we defined earlier, passing 6 as constraint1
  @MinLength(6, { 
    message: i18nValidationMessage('validation.MIN', { constraint1: 6 }) 
  })
  password?: string;
}