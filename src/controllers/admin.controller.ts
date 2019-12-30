import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {PermissionKey} from '../authorization';
import {authenticate} from '@loopback/authentication';

export class AdminController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/admin', {
    responses: {
      '200': {
        description: 'create admin',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async create(
    @param.query.string('admin_code') admin_code: string,
    @requestBody() user: User,
  ): Promise<User> {
    if (admin_code != '901029') {
      throw new HttpErrors.Forbidden('WRONG_ADMIN_CODE');
    }

    user.permissions = [
      PermissionKey.ViewOwnUser,
      PermissionKey.CreateUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.DeleteOwnUser,
      PermissionKey.UpdateAnyUser,
      PermissionKey.ViewAnyUser,
      PermissionKey.DeleteAnyUser,
    ];
    let foundUser = await this.userRepository.find({
      where: {email: user.email},
    });
    console.log('create admin', foundUser);

    if (foundUser) {
      throw new HttpErrors.BadRequest(`This email already exists`);
    } else {
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;
      return savedUser;
    }
  }

  /**
   * count user
   * @param where filter
   */
  @get('/admin/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKey.ViewAnyUser]})
  async count(
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return await this.userRepository.count(where);
  }

  /**
   * show all user
   * @param where filter
   */
  @get('/admin/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': User}},
          },
        },
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKey.ViewAnyUser]})
  async find(
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<User[]> {
    return await this.userRepository.find(filter);
  }

  /**
   * path all user
   * @param where filter
   */
  @patch('/admin/users', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt', {
    required: [PermissionKey.ViewAnyUser, PermissionKey.UpdateAnyUser],
  })
  async updateAll(
    @requestBody() user: User,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return await this.userRepository.updateAll(user, where);
  }

  /**
   * show user by id
   * @param id id
   */
  @get('/admin/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKey.ViewAnyUser]})
  async findById(@param.path.string('id') id: number): Promise<User> {
    let foundUser = await this.userRepository.findById(id);
    console.log('foundUser', foundUser);
    return foundUser;
  }

  /**
   * patch user by id
   * @param where filter
   */
  @patch('/admin/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authenticate('jwt', {
    required: [PermissionKey.ViewAnyUser, PermissionKey.UpdateAnyUser],
  })
  async updateById(
    @param.query.string('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  /**
   * delete user by id
   */
  @del('/admin/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt', {
    required: [PermissionKey.ViewAnyUser, PermissionKey.DeleteAnyUser],
  })
  async deleteById(@param.path.string('id') id: number): Promise<void> {
    ///
    await this.userRepository.deleteById(id);
  }
}
