import { OrderItem } from "./order-item.model";
import { Order } from "../orders/order.model";
import { Bicycle } from "../bicycles/bicycle.model";

export class OrderItemService {

  static async findAll() {
    return OrderItem.findAll({
      order: [["id", "ASC"]],
    });
  }


  static async findById(id: number) {
    return OrderItem.findByPk(id);
  }


  // Líneas de un pedido, cada una con su bicicleta (usa el alias "bicycle"
  // de OrderItem.belongsTo(Bicycle) en associations.ts)
  static async findByOrderId(orderId: number) {
    return OrderItem.findAll({
      where: { orderId },
      include: [{ model: Bicycle, as: "bicycle" }],
      order: [["id", "ASC"]],
    });
  }


  // Un pedido con sus bicicletas saltándose la tabla intermedia.
  // Usa el alias "bicycles" de Order.belongsToMany(Bicycle) (la N:M de verdad).
  // through.attributes decide qué columnas de order_items se muestran.
  static async findOrderWithBicycles(orderId: number) {
    return Order.findByPk(orderId, {
      include: [
        {
          model: Bicycle,
          as: "bicycles",
          through: { attributes: ["quantity", "unitPrice"] },
        },
      ],
    });
  }


  static async create(data: {
    orderId: number;
    bicycleId: number;
    quantity: number;
    unitPrice: number;
  }) {
    return OrderItem.create(data);
  }


  static async update(
    orderItem: OrderItem,
    data: {
      quantity?: number;
      unitPrice?: number;
    }
  ) {
    return orderItem.update(data);
  }


  static async delete(orderItem: OrderItem) {
    await orderItem.destroy();
  }
}
