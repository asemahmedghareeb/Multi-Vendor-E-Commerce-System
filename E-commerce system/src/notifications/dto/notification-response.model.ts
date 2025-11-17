import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class NotificationResponse {
  @Field()
  id: string;

  @Field()
  recipients: number;
}
