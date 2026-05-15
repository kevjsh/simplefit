import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ICustomer, ISignupData } from "../../interfaces/customer.interface";
import { CustomerCredentials } from "../../models/customers/customer.credential.model";
import { Customers } from "../../models/customers/customer.model";
import { createCustomerCredentials } from "./customer.credential.helper";
import { newCustomerMail } from "../emails/user.email";


export async function createCustomer(data: ISignupData): Promise<ICustomer> {
    const id = randomUUID();

    const customer = await Customers.create({
        Id: id,
        NID: data.NID,
        Name: data.Name,
        FirstLastName: data.FirstLastName,
        SecondLastName: data.SecondLastName,
        Birthday: new Date(data.Birthday),
        Gender: data.Gender,
        FirstTelephone: Number(data.FirstTelephone),
        SecondTelephone: data.SecondTelephone ? Number(data.SecondTelephone) : null,
        Address: data.Address,
        Email: data.Email,
        Details: null,
        ProfilePicture: null,
        LastLogin: null,
        Status: 'ACTIVE',
    } as any);

    const tempPassword = await createCustomerCredentials(id);

    await newCustomerMail(
        data.Name,
        data.Email,
        tempPassword,
        "Bienvenido a SimpleFit"
    );

    return customer;
}

export async function getCustomer(email: string): Promise<ICustomer | null> {

    const customer = await Customers.findOne({ where: { Email: email } });

    return customer;
}


export async function checkPassword(customer: ICustomer, password: string): Promise<boolean> {

    const customerCreds = await CustomerCredentials.findOne({ where: { CustomerId: customer.Id } });
    if (!customerCreds) return false;

    if (customerCreds.TempPassword) {
        if (customerCreds.TempPassword !== password) {
            // TempPassword didn't match — try the regular password
            if (!customerCreds.Password || !bcrypt.compareSync(password, customerCreds.Password))
                return false;
            // Regular password matched → TempPassword no longer needed
            await CustomerCredentials.update({ TempPassword: null }, { where: { CustomerId: customer.Id } });
        }
    } else {
        // No TempPassword — only regular password check
        if (customerCreds.Password && !bcrypt.compareSync(password, customerCreds.Password))
            return false;
    }

    await Customers.update({ LastLogin: new Date() }, { where: { Id: customer.Id } });
    return true;
}

export async function updateCustomerProfilePicture(email: string, profilePictureUrl: string): Promise<void> {
    try {
        await Customers.update(
            { ProfilePicture: profilePictureUrl },
            { where: { Email: email } }
        );
    } catch (error) {
        throw new Error(`Failed to update profile picture: ${error}`);
    }
}