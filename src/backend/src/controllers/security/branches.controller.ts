import { Request, Response } from "express";
import { Branches } from "../../models/branches.model";
import { logger } from "../../helpers/logger.helper";

export async function getAllBranches(_req: Request, res: Response) {
  try {
    const branches = await Branches.findAll({
      order: [["Name", "ASC"]],
    });
    return res.status(200).json(branches);
  } catch (error) {
    logger.error(`Error fetching branches: ${error}`);
    return res.status(500).json({ message: "Error fetching branches" });
  }
}
