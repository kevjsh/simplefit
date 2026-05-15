import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY, SECRET_REFRESH_JWT_KEY } from "../config/keys";
import { ICustomer } from "../interfaces/customer.interface";

export function generateToken(customer: ICustomer) {
  const { NID, Name, Email } = customer;

  return new Promise((resolve, reject) => {
    const payload = { NID, Name, Email };

    jwt.sign(
      payload,
      SECRET_JWT_KEY,
      {
        expiresIn: "2d",
      },
      (error, token) => {
        if (error) reject("Error creating JWT.");
        resolve(token);
      }
    );
  });
}

export function generateRefreshToken(customer: ICustomer) {
  const { Email } = customer;

  return new Promise((resolve, reject) => {
    jwt.sign(
      { Email },
      SECRET_REFRESH_JWT_KEY,
      {
        expiresIn: "7d",
      },
      (error, token) => {
        if (error) reject("Error creating Refresh JWT.");
        resolve(token);
      }
    );
  });
}