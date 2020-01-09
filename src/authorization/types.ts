import {PermissionKey} from './permission-key';

export interface UserPermissionsFn {
  (
    userPermissions: PermissionKey[],
    requiredPermissions: RequiredPermissions,
  ): boolean;
}

export interface MyUserProfile {
  id: string | undefined;
  email: string;
  fullName: string;
  permissions: PermissionKey[];
  password: string;
  getId: any;
  getIdObject: any;
  toJSON: any;
  toObject: any;
}

export interface RequiredPermissions {
  required: PermissionKey[];
}

export const UserProfileSchema = {
  type: 'object',
  required: ['email', 'password', 'fullName', 'phone', 'address'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    fullName: {type: 'string'},
    phone: {type: 'string'},
    address: {
      type: 'object',
      properties: {
        housenumber: {
          type: 'string',
        },
        building: {
          type: 'string',
        },
        block: {
          type: 'string',
        },
        street: {
          type: 'string',
        },
        ward: {
          type: 'string',
        },
        district: {
          type: 'string',
        },
      },
    },
  },
};

export const StaffProfileSchema = {
  type: 'object',
  required: ['email', 'password', 'fullName'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    fullName: {type: 'string'},
  },
};

export const UserRequestBody = {
  description: 'The input of create user function',
  required: true,
  content: {
    'application/json': {schema: UserProfileSchema},
  },
};

export const StaffRequestBody = {
  description: 'The input of create user function',
  required: true,
  content: {
    'application/json': {schema: UserProfileSchema},
  },
};

export interface Credential {
  email: string;
  password: string;
  permissions: PermissionKey[];
}

export const CredentialsSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
