import { CustomerCredentials } from "../../models/customers/customer.credential.model";

export async function createCustomerCredentials(customerId: string): Promise<string> {
    const tempPassword = Math.random().toString(36).slice(-5);

    await CustomerCredentials.create({
        CustomerId: customerId,
        Password: null,
        TempPassword: tempPassword,
        UpdatedOn: null,
    } as any);

    return tempPassword;
}
