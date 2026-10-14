import { BicycleDetails } from "../modules/bicycleDetails/bicycleDetails.model";
import { Bicycle } from "../modules/bicycles/bicycle.model";
import { Brand } from "../modules/brands/brand.model";
import { Customer } from "../modules/customers/customer.model";
import { Order } from "../modules/orders/order.model";
import { OrderItem } from "../modules/order-items/order-item.model";

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
    // Bicycle 1:1 BicycleDetails (la FK bicycleId vive en BicycleDetails)
    Bicycle.hasOne(BicycleDetails, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" });
    BicycleDetails.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });

    // Customer 1:N Order
    Customer.hasMany(Order, { foreignKey: "customerId", as: "orders", onDelete: "RESTRICT" });
    Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

    // Order N:M Bicycle (a través de OrderItem)
    Order.belongsToMany(Bicycle, {
        through: OrderItem,
        foreignKey: "orderId",
        otherKey: "bicycleId",
        as: "bicycles",
    });
    Bicycle.belongsToMany(Order, {
        through: OrderItem,
        foreignKey: "bicycleId",
        otherKey: "orderId",
        as: "orders",
    });

    // Y además las relaciones 1:N con la tabla intermedia, para poder
    // consultar las líneas (OrderItem) directamente
    Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
    OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
    Bicycle.hasMany(OrderItem, { foreignKey: "bicycleId", as: "orderItems" });
    OrderItem.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });
}