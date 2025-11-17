import { InputType, Field } from '@nestjs/graphql';
import { DeviceType } from '../entities/PushDevice.entity';

@InputType()
export class RegisterPushDeviceInput {
  @Field()
  playerId: string;

  @Field(() => DeviceType, { defaultValue: DeviceType.WEB })
  deviceType: DeviceType;
}
