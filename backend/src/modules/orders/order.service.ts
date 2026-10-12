import { Order, OrderStatus } from "./order.model";
import { Customer } from "../customers/customer.model";

export class OrderService {

  static async findAll() {
    return Order.findAll({
      order: [["id", "ASC"]],
    });
  }


  static async findById(id: number) {
    return Order.findByPk(id);
  }


  // Consulta ansiosa (eager): el pedido + los datos de su cliente.
  // El alias "customer" debe ser el mismo que en associations.ts
  static async findEagerById(id: number) {
    return Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
      ],
    });
  }


  // Todos los pedidos de un cliente, del más reciente al más antiguo.
  static async findByCustomerId(customerId: number) {
    return Order.findAll({
      where: { customerId },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["orderDate", "DESC"]],
    });
  }


  static async create(data: {
    customerId: number;
    orderDate?: Date;
    status?: OrderStatus;
  }) {
    return Order.create(data);
  }


  static async update(
    order: Order,
    data: {
      customerId?: number;
      orderDate?: Date;
      status?: OrderStatus;
    }
  ) {
    return order.update(data);
  }


  static async delete(order: Order) {
    await order.destroy();
  }
}