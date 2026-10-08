
import { Customer } from "./customer.model";

export class CustomerService {

  static async findAll() {
    return Customer.findAll({
      order: [["id", "ASC"]],
    });
  }

  static async findById(id: number) {
    return Customer.findByPk(id);
  }

  static async create(data: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return Customer.create(data as any);
  }

  static async update(
    Customer: Customer,
    data: {
      id?: number;
      name?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    return Customer.update(data);
  }

  static async delete(Customer: Customer) {
    await Customer.destroy();
  }

  static async findEagerById (id: number){
      return Customer.findByPk(id, {
        include:[
          {
            model: Customer,
            as: "brand"
          }
        ]
      });
    }
}
