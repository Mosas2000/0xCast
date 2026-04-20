import { Permission, Role, PermissionMatrix } from '@/types/rbac';

export class PermissionMatrixManager {
  private matrices: Map<string, PermissionMatrix>;

  constructor() {
    this.matrices = new Map();
  }

  createPermissionMatrix(roleId: string, permissions: Permission[]): PermissionMatrix {
    const matrix: PermissionMatrix = {
      roleId,
      permissions: {} as { [key in Permission]: boolean },
      resourceRestrictions: {},
    };

    Object.values(Permission).forEach(permission => {
      matrix.permissions[permission] = permissions.includes(permission);
    });

    this.matrices.set(roleId, matrix);
    return matrix;
  }

  getPermissionMatrix(roleId: string): PermissionMatrix | undefined {
    return this.matrices.get(roleId);
  }

  hasPermission(roleId: string, permission: Permission): boolean {
    const matrix = this.matrices.get(roleId);
    if (!matrix) return false;
    return matrix.permissions[permission] ?? false;
  }

  addPermission(roleId: string, permission: Permission): void {
    let matrix = this.matrices.get(roleId);
    if (!matrix) {
      matrix = this.createPermissionMatrix(roleId, []);
    }
    matrix.permissions[permission] = true;
  }

  removePermission(roleId: string, permission: Permission): void {
    const matrix = this.matrices.get(roleId);
    if (matrix) {
      matrix.permissions[permission] = false;
    }
  }

  addResourceRestriction(roleId: string, resourceId: string, allowed: boolean): void {
    let matrix = this.matrices.get(roleId);
    if (!matrix) {
      matrix = this.createPermissionMatrix(roleId, []);
    }

    if (!matrix.resourceRestrictions) {
      matrix.resourceRestrictions = {};
    }

    matrix.resourceRestrictions[resourceId] = allowed;
  }

  canAccessResource(roleId: string, resourceId: string): boolean {
    const matrix = this.matrices.get(roleId);
    if (!matrix || !matrix.resourceRestrictions) return true;
    return matrix.resourceRestrictions[resourceId] ?? true;
  }

  getPermissionsForRole(roleId: string): Permission[] {
    const matrix = this.matrices.get(roleId);
    if (!matrix) return [];

    return Object.entries(matrix.permissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission]) => permission as Permission);
  }

  getMissingPermissions(roleId: string, requiredPermissions: Permission[]): Permission[] {
    const matrix = this.matrices.get(roleId);
    if (!matrix) return requiredPermissions;

    return requiredPermissions.filter(
      permission => !matrix.permissions[permission]
    );
  }

  checkMultiplePermissions(roleId: string, permissions: Permission[], requireAll: boolean = true): boolean {
    const matrix = this.matrices.get(roleId);
    if (!matrix) return false;

    if (requireAll) {
      return permissions.every(permission => matrix.permissions[permission]);
    } else {
      return permissions.some(permission => matrix.permissions[permission]);
    }
  }

  updatePermissionMatrix(roleId: string, permissions: Permission[]): PermissionMatrix {
    this.matrices.delete(roleId);
    return this.createPermissionMatrix(roleId, permissions);
  }

  getAllMatrices(): PermissionMatrix[] {
    return Array.from(this.matrices.values());
  }

  deleteMatrix(roleId: string): boolean {
    return this.matrices.delete(roleId);
  }

  comparePermissions(roleId1: string, roleId2: string): {
    common: Permission[];
    onlyInRole1: Permission[];
    onlyInRole2: Permission[];
  } {
    const perms1 = new Set(this.getPermissionsForRole(roleId1));
    const perms2 = new Set(this.getPermissionsForRole(roleId2));

    const common = Array.from(perms1).filter(p => perms2.has(p));
    const onlyInRole1 = Array.from(perms1).filter(p => !perms2.has(p));
    const onlyInRole2 = Array.from(perms2).filter(p => !perms1.has(p));

    return { common, onlyInRole1, onlyInRole2 };
  }

  getPermissionCoverage(roleId: string): number {
    const matrix = this.matrices.get(roleId);
    if (!matrix) return 0;

    const totalPermissions = Object.keys(matrix.permissions).length;
    const grantedPermissions = Object.values(matrix.permissions).filter(Boolean).length;

    return totalPermissions > 0 ? (grantedPermissions / totalPermissions) * 100 : 0;
  }
}
