import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ISignupData } from "../interfaces/customer.interface";
import { createCustomer, getCustomer, checkPassword } from "../helpers/customer/customer.helper";
import { generateToken, generateRefreshToken } from "../helpers/jwtGenerator";
import { logger } from "../helpers/logger.helper";
import { cookieParams } from "../config/keys";
import { CustomerCredentials } from "../models/customers/customer.credential.model";
import { changePasswordMail, recoveryPasswordMail } from "../helpers/emails/customer.email";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const customer = await getCustomer(email);
    if (!customer) throw new Error('Email or password is incorrect.');

    const customerCreds = await CustomerCredentials.findOne({ where: { CustomerId: customer.Id } });
    const isUsingTempPassword = !!(customerCreds?.TempPassword && customerCreds.TempPassword === password);

    if (!await checkPassword(customer, password)) throw new Error('Email or password is incorrect.');

    if (String(customer.Status ?? '').toUpperCase() !== 'ACTIVE') {
      logger.warn(`Login blocked — inactive account. Email=${email}`);
      res.status(403).json({
        code: 'ACCOUNT_INACTIVE',
        message: 'Tu cuenta ha sido inactivada. Contacta a soporte para más información.',
      });
      return;
    }

    const token = await generateToken(customer);
    const refreshToken = await generateRefreshToken(customer);

    res.cookie('refreshToken', refreshToken, cookieParams);
    res.json({ message: 'Login success.', token, isTempPassword: isUsingTempPassword });

  } catch (error) {
    logger.error(`Login error. ${error}`);
    res.status(400).json({ message: `Login error. ${error}` });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {

  try {

    const {
      NID, Name, FirstLastName, SecondLastName, Birthday,
      Gender, FirstTelephone, SecondTelephone, Address, Email,
    } = req.body as ISignupData;

    const existing = await getCustomer(Email);
    if (existing) {
      res.status(409).json({ message: 'Email is already registered.' });
      return;
    }

    const customer = await createCustomer({
      NID, Name, FirstLastName, SecondLastName, Birthday,
      Gender, FirstTelephone, SecondTelephone, Address, Email,
    });

    res.status(201).json({ message: 'Customer created successfully.', customerId: customer.Id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: String(error) });
  }

};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { email, password, newPassword, confirmation } = req.body;

  try {
    if (newPassword !== confirmation) throw new Error('Las contraseñas no coinciden.');

    const customer = await getCustomer(email);
    if (!customer) throw new Error('The email is not registered.');

    const customerCreds = await CustomerCredentials.findOne({ where: { CustomerId: customer.Id } });
    if (!customerCreds) throw new Error('Customer credentials not found.');

    const isTempPassword = customerCreds.TempPassword && customerCreds.TempPassword === password;

    if (!isTempPassword) {
      if (!customerCreds.Password || !bcrypt.compareSync(password, customerCreds.Password))
        throw new Error('La contraseña actual es incorrecta.');
    }

    await CustomerCredentials.update(
      { Password: bcrypt.hashSync(newPassword, 10), TempPassword: null, UpdatedOn: new Date() },
      { where: { CustomerId: customer.Id } }
    );

    await changePasswordMail(
      customer.Name,
      customer.Email,
      "Tu contraseña ha sido actualizada — SimpleFit"
    );

    res.json({ success: true });
  } catch (error) {
    logger.error(`Change password error. ${error}`);
    res.status(400).json({ success: false, message: String(error) });
  }
};

export const recoveryPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const customer = await getCustomer(email);
    if (!customer) throw new Error('The email is not registered.');

    const tempPassword = Math.random().toString(36).slice(-5);

    await CustomerCredentials.update(
      { TempPassword: tempPassword },
      { where: { CustomerId: customer.Id } }
    );

    await recoveryPasswordMail(
      customer.Name,
      customer.Email,
      tempPassword,
      "Recupera el acceso a tu cuenta — SimpleFit"
    );

    res.json({ success: true });
  } catch (error) {
    logger.error(`Recovery password error. ${error}`);
    res.status(400).json({ success: false, message: String(error) });
  }
};