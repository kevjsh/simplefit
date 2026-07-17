import { Request, Response } from "express";
import { RolePermissions } from "../../../models/authorize/rolePermissions.model";
import { Roles } from "../../../models/roles/role.model";
import { Permissions } from "../../../models/authorize/permissions.model";
import { logger } from "../../../helpers/logger.helper";

export async function getAllRolePermissions(req: Request, res: Response) {
  try {
    const rolePermissions = await RolePermissions.findAll({
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["Id", "RoleType", "Description"],
        },
        {
          model: Permissions,
          as: "permission",
          attributes: ["Id", "PermissionKey", "Description"],
        },
      ],
      order: [
        ["RoleId", "ASC"],
        ["PermissionId", "ASC"],
      ],
    });
    return res.status(200).json(rolePermissions);
  } catch (error) {
    logger.error(`Error fetching role permissions: ${error}`);
    return res.status(500).json({ message: "Error fetching role permissions" });
  }
}

export async function createRolePermission(req: Request, res: Response) {
  try {
    const { RoleId, PermissionId } = req.body;

    if (!RoleId || typeof RoleId !== "string" || RoleId.trim().length === 0) {
      return res.status(400).json({ message: "RoleId is required" });
    }

    if (!PermissionId || typeof PermissionId !== "number") {
      return res.status(400).json({ message: "PermissionId is required and must be a number" });
    }

    const role = await Roles.findByPk(RoleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const permission = await Permissions.findByPk(PermissionId);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    const existingRolePermission = await RolePermissions.findOne({
      where: { RoleId: RoleId.trim(), PermissionId },
    });

    if (existingRolePermission) {
      return res.status(400).json({ message: "Role permission already exists" });
    }

    await RolePermissions.create({
      RoleId: RoleId.trim(),
      PermissionId,
    } as any);

    const rolePermissionWithRelations = await RolePermissions.findOne({
      where: { RoleId: RoleId.trim(), PermissionId },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["Id", "RoleType", "Description"],
        },
        {
          model: Permissions,
          as: "permission",
          attributes: ["Id", "PermissionKey", "Description"],
        },
      ],
    });

    return res.status(201).json(rolePermissionWithRelations);
  } catch (error) {
    logger.error(`Error creating role permission: ${error}`);
    return res.status(500).json({ message: "Error creating role permission" });
  }
}

export async function deleteRolePermission(req: Request, res: Response) {
  try {
    const { roleId, permissionId } = req.params;
    const permissionIdNum = parseInt(permissionId, 10);

    if (!roleId || roleId.trim().length === 0) {
      return res.status(400).json({ message: "Invalid roleId" });
    }

    if (isNaN(permissionIdNum)) {
      return res.status(400).json({ message: "Invalid permissionId" });
    }

    const rolePermission = await RolePermissions.findOne({
      where: { RoleId: roleId.trim(), PermissionId: permissionIdNum },
    });

    if (!rolePermission) {
      return res.status(404).json({ message: "Role permission not found" });
    }

    await RolePermissions.destroy({
      where: { RoleId: roleId.trim(), PermissionId: permissionIdNum },
    });

    return res.status(200).json({ message: "Role permission deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting role permission: ${error}`);
    return res.status(500).json({ message: "Error deleting role permission" });
  }
}
