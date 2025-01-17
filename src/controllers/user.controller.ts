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
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
//add
import {inject, Getter, Setter} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {
  MyUserProfile,
  Credential,
  MyAuthBindings,
  PermissionKey,
  CredentialsRequestBody,
  UserRequestBody,
  UserProfileSchema,
  JWTService,
} from '../authorization';
import {
  authenticate,
  TokenService,
  AuthenticationBindings,
} from '@loopback/authentication';
import {genSalt, hash} from 'bcryptjs';
import VARIABLE from '../var';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile | User>,
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    public setCurrentUser: Setter<MyUserProfile | User>,
  ) {}

  @post('/user', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async create(
    @requestBody(UserRequestBody)
    user: User,
  ): Promise<User> {
    user.permissions = [
      PermissionKey.ViewOwnUser,
      PermissionKey.CreateUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.DeleteOwnUser,
    ];

    const foundUser = await this.userRepository.find({
      where: {
        email: user.email,
      },
    });
    if (foundUser.length != 0) {
      throw new HttpErrors.BadRequest(`This email already exists`);
    } else {
      //hash password
      const salt = await genSalt(VARIABLE.ROUNDS);
      // user.password = await hash(user.password, salt);

      const savedAdmin = await this.userRepository.create(user);
      delete savedAdmin.password;
      return savedAdmin;
    }
  }

  @get('/user/count', {
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
    return this.userRepository.count(where);
  }

  @get('/user', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
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
    return this.userRepository.find(filter);
  }

  @patch('/user', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/user/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async findById(@param.path.number('id') id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  @patch('/user/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/user/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/user/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  //custom
  @post('/user/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {},
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credential: Credential,
  ): Promise<{token: string}> {
    const token = await this.jwtService.getToken(credential);
    return {token};
  }

  @get('/user/me', {
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKey.ViewOwnUser]})
  async printCurrentUser(): Promise<MyUserProfile | User> {
    return await this.getCurrentUser();
  }

  @patch('/user/me', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKey.UpdateOwnUser]})
  async updateCurrentUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<User> {
    const currUser = await this.getCurrentUser();
    console.log('currUser', currUser);
    const res = await this.userRepository.updateById(currUser.id, user);
    console.log('res', res);
    const updatedUser = await this.userRepository.findById(currUser.id);
    console.log('updatedUser', updatedUser);
    const resUpdate = await this.setCurrentUser(updatedUser);
    console.log('resUpdate', resUpdate);
    return updatedUser;
  }
}
