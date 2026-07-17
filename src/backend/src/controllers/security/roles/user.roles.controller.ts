import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { UserRoles } from "../../../models/roles/user.role.model";
import { Roles } from "../../../models/roles/role.model";
import { Customers } from "../../../models/customers/customer.model";
import { logger } from "../../../helpers/logger.helper";
import { getPaginationParams, buildPaginatedResult } from "../../../helpers/utils";

export async function createUserRole(req: Request, res: Response) {
  try {
    const { CustomerId, RoleId, BranchId, AssignedBy, Status } = req.body || {};

    if (!CustomerId || !RoleId || !AssignedBy) {
      return res.status(400).json({
        message: "CustomerId, RoleId y AssignedBy son requeridos",
      });
    }

    const payload = {
      CustomerId,
      RoleId,
      BranchId: BranchId != null && BranchId !== "" ? String(BranchId) : null,
      AssignedBy,
      Status: Status || "ACTIVE",
    } as any;

    const created = await UserRoles.create(payload);
    const withRole = await UserRoles.findByPk(created.get("Id") as string, {
      include: [
        { model: Roles, as: "Role" },
        {
          model: Customers,
          as: "Customer",
          attributes: ["Id", "Name", "FirstLastName", "SecondLastName", "ProfilePicture", "Email"],
        },
      ],
    });

    return res.status(201).json(withRole || created);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "El usuario ya tiene asignado este rol" });
    }
    logger.error(`createUserRole error: ${error}`);
    return res.status(500).json({ message: "Error creando user role" });
  }
}

export async function deleteUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const target = (await UserRoles.findByPk(id, {
      include: [{ model: Roles, as: "Role" }],
    })) as any;

    if (!target) {
      return res.status(404).json({ message: "User role no encontrado" });
    }

    const roleType = (target?.Role?.RoleType || "").toString().toLowerCase();
    if (roleType === "admin" || roleType === "administrator") {
      const activeAdmins = await UserRoles.count({
        where: { RoleId: target.RoleId, Status: "ACTIVE" },
      });
      if (activeAdmins <= 1) {
        return res.status(400).json({
          message: "No se puede eliminar el único administrador del sistema",
        });
      }
    }

    const deleted = await UserRoles.destroy({ where: { Id: id } });
    if (!deleted) {
      return res.status(404).json({ message: "User role no encontrado" });
    }

    return res.status(200).json({ message: "User role eliminado" });
  } catch (error) {
    logger.error(`deleteUserRole error: ${error}`);
    return res.status(500).json({ message: "Error eliminando user role" });
  }
}

export async function deactivateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const [updated] = await UserRoles.update(
      { Status: "INACTIVE" },
      { where: { Id: id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User role no encontrado" });
    }

    const found = await UserRoles.findByPk(id, {
      include: [
        { model: Roles, as: "Role" },
        {
          model: Customers,
          as: "Customer",
          attributes: ["Id", "Name", "FirstLastName", "SecondLastName", "ProfilePicture", "Email"],
        },
      ],
    });

    return res.status(200).json(found);
  } catch (error) {
    logger.error(`deactivateUserRole error: ${error}`);
    return res.status(500).json({ message: "Error desactivando user role" });
  }
}

export async function activateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const [updated] = await UserRoles.update(
      { Status: "ACTIVE" },
      { where: { Id: id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User role no encontrado" });
    }

    const found = await UserRoles.findByPk(id, {
      include: [
        { model: Roles, as: "Role" },
        {
          model: Customers,
          as: "Customer",
          attributes: ["Id", "Name", "FirstLastName", "SecondLastName", "ProfilePicture", "Email"],
        },
      ],
    });

    return res.status(200).json(found);
  } catch (error) {
    logger.error(`activateUserRole error: ${error}`);
    return res.status(500).json({ message: "Error activando user role" });
  }
}

export async function getAllUserRoles(req: Request, res: Response) {
  try {
    const params = getPaginationParams(req);
    const branchIdRaw = req.query.branchId;
    const customerIdRaw = req.query.customerId;
    const whereClause: Record<string, unknown> = {};

    if (branchIdRaw != null && String(branchIdRaw).trim() !== "") {
      whereClause.BranchId = String(branchIdRaw);
    }

    if (customerIdRaw != null && String(customerIdRaw).trim() !== "") {
      whereClause.CustomerId = String(customerIdRaw).trim();
    }

    const { rows, count } = await UserRoles.findAndCountAll({
      where: whereClause,
      include: [
        { model: Roles, as: "Role" },
        {
          model: Customers,
          as: "Customer",
          attributes: ["Id", "Name", "FirstLastName", "SecondLastName", "ProfilePicture", "Email"],
        },
      ],
      limit: params.limit,
      offset: params.offset,
      order: [["AssignedAt", "DESC"]],
    });

    return res.status(200).json(buildPaginatedResult(rows, count, params));
  } catch (error) {
    logger.error(`getAllUserRoles error: ${error}`);
    return res.status(500).json({ message: "Error obteniendo roles de usuarios" });
  }
}
