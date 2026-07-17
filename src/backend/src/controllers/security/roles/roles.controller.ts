import { Request, Response } from "express";
import { Roles } from "../../../models/roles/role.model";
import { logger } from "../../../helpers/logger.helper";

export async function getAllRoles(_req: Request, res: Response) {
  try {
    const roles = await Roles.findAll({
      order: [["RoleType", "ASC"]],
    });
    return res.status(200).json(roles);
  } catch (error) {
    logger.error(`Error fetching roles: ${error}`);
    return res.status(500).json({ message: "Error fetching roles" });
  }
}
