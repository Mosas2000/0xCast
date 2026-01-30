/**
 * Utility for managing role-based access control (RBAC) within the protocol's governance and treasury layers.
 */
export class AccessControl {
    public static ROLES = {
        ADMIN: 'role_admin',
        ORACLE: 'role_oracle',
        TREASURY: 'role_treasury',
        MODERATOR: 'role_moderator',
        USER: 'role_user'
    };

    /**
     * Checks if a user has a specific role.
     * @param userRoles Array of roles assigned to the user
     * @param requiredRole The role required for the action
     */
    static hasRole(userRoles: string[], requiredRole: string): boolean {
        return userRoles.includes(requiredRole) || userRoles.includes(this.ROLES.ADMIN);
    }

    /**
     * Checks if a user has any of the specified roles.
     */
    static hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
        return requiredRoles.some(role => this.hasRole(userRoles, role));
    }

    /**
     * Returns a list of permissions associated with a role.
     */
    static getPermissions(role: string): string[] {
        switch (role) {
            case this.ROLES.ADMIN: return ['all'];
            case this.ROLES.ORACLE: return ['resolve_market', 'report_data'];
            case this.ROLES.TREASURY: return ['disburse_funds', 'incentivize'];
            case this.ROLES.MODERATOR: return ['hide_comment', 'ban_user', 'review_report'];
            default: return ['place_stake', 'create_market', 'comment'];
        }
    }

    /**
     * Validates if an action is authorized.
     */
    static isAuthorized(userRoles: string[], action: string): boolean {
        const allPerms = userRoles.flatMap(role => this.getPermissions(role));
        return allPerms.includes(action) || allPerms.includes('all');
    }
}
