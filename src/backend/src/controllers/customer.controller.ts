import { Request, Response } from "express";
import axios from "axios";
import { getCustomerByNID } from "../helpers/customer/customer.helper";
import { logger } from "../helpers/logger.helper";

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const lookupByNID = async (req: Request, res: Response): Promise<void> => {
  const { nid } = req.params;

  try {
    const existing = await getCustomerByNID(nid);
    if (existing) {
      res.status(409).json({ message: "El usuario ya se encuentra registrado." });
      return;
    }

    let name: string | null = null;
    try {
      const haciendaRes = await axios.get(
        `https://api.hacienda.go.cr/fe/ae?identificacion=${nid}`,
        { timeout: 5000 }
      );
      if (haciendaRes.data?.nombre) {
        name = toTitleCase(haciendaRes.data.nombre);
      }
    } catch {
      // Hacienda API unavailable or NID not found — proceed without name
    }

    res.status(200).json({ nid, name });
  } catch (error) {
    logger.error(`NID lookup error. ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};
