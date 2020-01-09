export const enum PermissionKey {
  // For accessing own (logged in user) profile
  ViewOwnUser = 'ViewOwnUser',
  // For creating a user
  CreateUser = 'CreateUser',
  // For updating own (logged in user) profile
  UpdateOwnUser = 'UpdateOwnUser',
  // For deleting a user
  DeleteOwnUser = 'DeleteOwnUser',

  //admin
  // For updating other users profile
  UpdateAnyUser = 'UpdateAnyUser',
  // For accessing other users profile.
  ViewAnyUser = 'ViewAnyUser',
  // For deleting a user
  DeleteAnyUser = 'DeleteAnyUser',

  // For creating a permission
  CreatePermission = 'CreatePermission',
  // For access any permission
  ViewPermission = 'ViewPermission',
  // For delete a permission
  DeletePermission = 'DeletePermission',
  // For change a permission
  UpdatePermission = 'UpdatePermission',
}
