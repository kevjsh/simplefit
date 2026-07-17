import { Request, Response } from "express";
import { Permissions } from "../../../models/authorize/permissions.model";
import { RolePermissions } from "../../../models/authorize/rolePermissions.model";
import { logger } from "../../../helpers/logger.helper";

export async function getAllPermissions(req: Request, res: Response) {
  try {
    const permissions = await Permissions.findAll({
      order: [["PermissionKey", "ASC"]],
    });
    return res.status(200).json(permissions);
  } catch (error) {
    logger.error(`Error fetching permissions: ${error}`);
    return res.status(500).json({ message: "Error fetching permissions" });
  }
}

export async function createPermission(req: Request, res: Response) {
  try {
    const { PermissionKey, Description } = req.body;

    if (!PermissionKey || typeof PermissionKey !== "string" || PermissionKey.trim().length === 0) {
      return res.status(400).json({ message: "PermissionKey is required" });
    }

    const existingPermission = await Permissions.findOne({
      where: { PermissionKey: PermissionKey.trim() },
    });

    if (existingPermission) {
      return res.status(400).json({ message: "Permission key already exists" });
    }

    const newPermission = await Permissions.create({
      PermissionKey: PermissionKey.trim(),
      Description: Description || null,
    } as any);

    return res.status(201).json(newPermission);
  } catch (error) {
    logger.error(`Error creating permission: ${error}`);
    return res.status(500).json({ message: "Error creating permission" });
  }
}

export async function deletePermission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      return res.status(400).json({ message: "Invalid permission ID" });
    }

    const permission = await Permissions.findByPk(permissionId);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    await RolePermissions.destroy({
      where: { PermissionId: permissionId },
    });

    await Permissions.destroy({
      where: { Id: permissionId },
    });

    return res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting permission: ${error}`);
    return res.status(500).json({ message: "Error deleting permission" });
  }
}
