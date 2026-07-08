import { Request, Response, NextFunction } from "express";
import { getCustomer } from "../helpers/customer/customer.helper";
import { UserRoles } from "../models/roles/user.role.model";
import { Roles } from "../models/roles/role.model";
import { RolePermissions } from "../models/authorize/rolePermissions.model";
import { Permissions } from "../models/authorize/permissions.model";
import { logger } from "../helpers/logger.helper";
import { Op } from "sequelize";

export function authorizePermission(requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Get user from session
      if (!req.session || !req.session.Email) {
        logger.warn(`Authorization - No session found for URL: ${req.originalUrl}`);
        return res.status(401).json({
          message: "Unauthorized: No session found."
        });
      }

      const userEmail = req.session.Email;

      const customer = await getCustomer(userEmail);
      if (!customer) {
        logger.warn(`Authorization - Customer not found for email: ${userEmail}`);
        return res.status(403).json({
          message: "Forbidden: Customer not found."
        });
      }

      // Get all user roles for this customer with role information
      const userRoles = await UserRoles.findAll({
        where: {
          CustomerId: customer.Id,
          Status: 'ACTIVE'
        },
        include: [{
          model: Roles,
          as: 'Role',
          attributes: ['RoleType']
        }]
      });

      if (!userRoles || userRoles.length === 0) {
        logger.warn(`Authorization - No roles found for customer: ${userEmail}`);
        return res.status(403).send("Insufficient permissions.");
      }

      // Check if user is admin - if so, allow access immediately
      const isAdmin = userRoles.some(ur => (ur as any).Role?.RoleType?.toLowerCase() === 'admin');
      if (isAdmin) return next();

      // Extract role IDs for permission check
      const roleIds = userRoles.map(ur => (ur as any).RoleId);

      // Get all permissions for these roles
      const rolePermissions = await RolePermissions.findAll({
        where: {
          RoleId: {
            [Op.in]: roleIds
          }
        },
        include: [{
          model: Permissions,
          as: 'permission',
          attributes: ['PermissionKey']
        }]
      });

      // Extract permission keys
      const userPermissions = rolePermissions
        .map(rp => (rp as any).permission?.PermissionKey)
        .filter((key): key is string => key !== undefined && key !== null);

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some(requiredPerm =>
        userPermissions.includes(requiredPerm)
      );

      if (!hasPermission) {
        logger.warn(`Authorization - Insufficient permissions for user: ${userEmail}. Required: ${requiredPermissions.join(', ')}, Has: ${userPermissions.join(', ')}`);
        return res.status(403).send("Insufficient permissions.");
      }

      // User has required permissions, continue
      next();

    } catch (error) {
      logger.error(`Authorization error for URL: ${req.originalUrl}. Error: ${error}`);
      return res.status(500).json({
        message: "Internal server error during authorization."
      });
    }
  };
}

