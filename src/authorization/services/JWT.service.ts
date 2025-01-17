import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {promisify} from 'util';
import {TokenService} from '@loopback/authentication';
import {TokenServiceConstants} from '../keys';
import {MyUserProfile, Credential} from '../types';
import {repository} from '@loopback/repository';
import {UserRepository} from '../../repositories';
import * as _ from 'lodash';
import {toJSON} from '@loopback/testlab';
import {compare} from 'bcryptjs';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async verifyToken(token: string): Promise<MyUserProfile | any> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    const decryptedToken = await verifyAsync(
      token,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    let userProfile = _.pick(decryptedToken, [
      'id',
      'email',
      'fullName',
      `permissions`,
    ]);
    return userProfile;
  }

  async generateToken(userProfile: MyUserProfile | any): Promise<string> {
    const token = await signAsync(
      userProfile,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
      {
        expiresIn: TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
      },
    );
    return token;
  }

  async getToken(credential: Credential): Promise<string> {
    const foundUser = await this.userRepository.findOne({
      where: {email: credential.email},
    });

    if (!foundUser) {
      throw new HttpErrors['NotFound'](
        `User with email ${credential.email} not found.`,
      );
    }

    const passwordMatched = await compare(
      credential.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }
    const currentUser: MyUserProfile = _.pick(toJSON(foundUser), [
      'id',
      'email',
      'fullName',
      'permissions',
    ]) as MyUserProfile;
    const token = await this.generateToken(currentUser);
    return token;
  }
}
