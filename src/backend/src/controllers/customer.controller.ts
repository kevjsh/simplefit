import { Request, Response } from "express";
import axios from "axios";
import { getCustomerByNID, getCustomerProfile, updateCustomerProfilePicture } from "../helpers/customer/customer.helper";
import { firebaseStorageHelper } from "../helpers/firebaseStorage.helper";
import { logger } from "../helpers/logger.helper";
import { Customers } from "../models/customers/customer.model";

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

export const getProfileByEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  try {
    const customer = await getCustomerProfile(decodeURIComponent(email));
    if (!customer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    logger.error(`Get profile error. ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;
  const decodedEmail = decodeURIComponent(email);

  try {
    if (req.session?.Email !== decodedEmail) {
      res.status(403).json({ message: "No tienes permisos para actualizar este perfil." });
      return;
    }

    const customer = await getCustomerProfile(decodedEmail);
    if (!customer) {
      res.status(404).json({ message: "Cliente no encontrado." });
      return;
    }

    const { Name, FirstLastName, SecondLastName, FirstTelephone, SecondTelephone, Gender, Address } = req.body;

    const updateData: Record<string, unknown> = {};
    if (Name !== undefined) updateData.Name = String(Name).trim();
    if (FirstLastName !== undefined) updateData.FirstLastName = String(FirstLastName).trim();
    if (SecondLastName !== undefined) updateData.SecondLastName = String(SecondLastName).trim();
    if (FirstTelephone !== undefined) updateData.FirstTelephone = Number(FirstTelephone);
    if (SecondTelephone !== undefined) updateData.SecondTelephone = SecondTelephone ? Number(SecondTelephone) : null;
    if (Gender !== undefined) updateData.Gender = Gender;
    if (Address !== undefined) updateData.Address = Address;

    await Customers.update(updateData, { where: { Email: decodedEmail } });

    const updated = await getCustomerProfile(decodedEmail);

    logger.info(`Profile updated for ${decodedEmail}`);
    res.status(200).json({ message: "Perfil actualizado exitosamente.", customer: updated });
  } catch (error) {
    logger.error(`Update profile error. ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No image file provided." });
      return;
    }

    if (!firebaseStorageHelper.isValidImageType(file.mimetype)) {
      res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed." });
      return;
    }

    if (!firebaseStorageHelper.isValidFileSize(file.size)) {
      res.status(400).json({ message: "File too large. Maximum size is 5MB." });
      return;
    }

    const email = req.session?.Email;
    if (!email) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    // Delete previous profile picture if exists
    const customer = await getCustomerProfile(email);
    if (!customer) {
      res.status(404).json({ message: "Customer not found." });
      return;
    }

    if (customer.ProfilePicture) {
      try {
        const oldPath = firebaseStorageHelper.extractPathFromURL(customer.ProfilePicture);
        await firebaseStorageHelper.deleteFile(oldPath);
      } catch {
        logger.warn(`Could not delete old profile picture for ${email}`);
      }
    }

    const storagePath = firebaseStorageHelper.generateProfilePicturePath(email, file.originalname);
    const downloadUrl = await firebaseStorageHelper.uploadFile(file, storagePath);

    await updateCustomerProfilePicture(email, downloadUrl);

    logger.info(`Profile picture updated for ${email}`);
    res.status(200).json({ message: "Profile picture updated successfully.", profilePicture: downloadUrl });
  } catch (error) {
    logger.error(`Upload profile picture error. ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};
