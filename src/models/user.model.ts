import {Entity, model, property} from '@loopback/repository';
import {PermissionKey} from '../authorization';
@model()
export class User extends Entity {
  static findOrCreate(
    arg0: {facebookId: any},
    arg1: (err: any, user: any) => any,
  ) {
    throw new Error('Method not implemented.');
  }
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  role: string;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  @property({
    type: 'string',
  })
  middleName?: string;

  @property({
    type: 'string',
  })
  fullName?: string;

  @property({
    type: 'object',
  })
  address?: object;

  @property({
    type: 'string',
  })
  password: string;

  @property.array(String)
  permissions: PermissionKey[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
