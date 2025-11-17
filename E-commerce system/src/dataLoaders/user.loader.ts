import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Scope } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(private readonly authService: AuthService) {}

  readonly userById = new DataLoader<string, User>(
    async (userIds: string[]) => {
      const users = await this.authService.findByIds(userIds);

      const userMap = new Map(users.map((user) => [user.id, user]));

      return userIds.map((id) => userMap.get(id) as User);
    },
  );
}
