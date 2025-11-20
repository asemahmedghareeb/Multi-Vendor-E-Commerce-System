import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { User } from 'src/users/entities/user.entity';



@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  public readonly batchUsers = new DataLoader<string, User>(async (ids) => {
    const users = await this.userRepo.findBy({ id: In(ids) });
    const map = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => map.get(id) || new Error(`User ${id} not found`));
  });
}