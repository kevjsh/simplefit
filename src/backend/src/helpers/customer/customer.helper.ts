import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Op, WhereOptions } from 'sequelize';
import { ICustomer, ISignupData } from "../../interfaces/customer.interface";
import { IUserRole } from "../../interfaces/roles/user.role.interface";
import { CustomerCredentials } from "../../models/customers/customer.credential.model";
import { Customers } from "../../models/customers/customer.model";
import { UserRoles } from "../../models/roles/user.role.model";
import { Roles } from "../../models/roles/role.model";
import { createCustomerCredentials } from "./customer.credential.helper";
import { newCustomerMail } from "../emails/customer.email";


export async function createCustomer(data: ISignupData): Promise<ICustomer> {
    const id = randomUUID();

    const customer = await Customers.create({
        Id: id,
        NID: data.NID,
        Name: data.Name,
        FirstLastName: data.FirstLastName,
        SecondLastName: data.SecondLastName,
        Birthday: new Date(data.Birthday + "T12:00:00"),
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

export async function getCustomerByNID(nid: string): Promise<ICustomer | null> {

    return await Customers.findOne({ where: { NID: nid } });
}

function escapeLike(value: string): string {
    return value.replace(/[%_\\]/g, '\\$&');
}

/**
 * Returns a page of Customers sorted by the requested column, along with the
 * total count of records for pagination metadata. Sorting by `Name` also
 * breaks ties by last names, so the roster reads as truly alphabetical
 * instead of just grouping first names.
 *
 * When `search` is provided, matches NID, Name, FirstLastName, SecondLastName
 * or Email (case-insensitive partial match).
 */
export async function getCustomersPaginated(
    limit: number,
    offset: number,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    search: string | null = null
): Promise<{ rows: ICustomer[]; count: number }> {
    const order = sortBy === 'Name'
        ? [['Name', sortOrder], ['FirstLastName', sortOrder], ['SecondLastName', sortOrder]]
        : [[sortBy, sortOrder]];

    let where: WhereOptions | undefined;
    if (search) {
        const pattern = `%${escapeLike(search)}%`;
        where = {
            [Op.or]: [
                { NID: { [Op.like]: pattern } },
                { Name: { [Op.like]: pattern } },
                { FirstLastName: { [Op.like]: pattern } },
                { SecondLastName: { [Op.like]: pattern } },
                { Email: { [Op.like]: pattern } },
            ],
        };
    }

    const { rows, count } = await Customers.findAndCountAll({
        where,
        limit,
        offset,
        order: order as any,
    });

    return { rows, count };
}

export async function getCustomerProfile(email: string): Promise<Omit<ICustomer, 'UserRoles'> | null> {

    return await Customers.findOne({
        where: { Email: email },
        attributes: [
            'Id', 'NID', 'Name', 'FirstLastName', 'SecondLastName',
            'Birthday', 'Gender', 'FirstTelephone', 'SecondTelephone',
            'Address', 'Email', 'Details', 'ProfilePicture',
            'RegistrationDate', 'LastLogin', 'Status',
        ],
    });
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

/**
 * Returns all roles currently assigned to a customer with Status='ACTIVE',
 * including the underlying Role description. Used to gate admin-only areas.
 */
export async function getCustomerActiveRoles(customerId: string): Promise<IUserRole[]> {
    const rows = await UserRoles.findAll({
        where: { CustomerId: customerId, Status: 'ACTIVE' },
        include: [{
            model: Roles,
            as: 'Role',
            attributes: ['Id', 'RoleType', 'Description'],
        }],
        order: [['AssignedAt', 'DESC']],
    });

    return rows.map((r) => {
        const plain: any = (r as any).get ? (r as any).get({ plain: true }) : r;
        return plain as IUserRole;
    });
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

export async function updateCustomerStatus(customerId: string, status: string): Promise<ICustomer | null> {
    const customer = await Customers.findByPk(customerId);
    if (!customer) return null;

    await customer.update({ Status: status });
    return customer;
}

export async function updateCustomerDetails(customerId: string, details: string | null): Promise<ICustomer | null> {
    const customer = await Customers.findByPk(customerId);
    if (!customer) return null;

    await customer.update({ Details: details } as any);
    return customer;
}