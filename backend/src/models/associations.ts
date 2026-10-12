import { BicycleDetails } from "../modules/bicycleDetails/bicycleDetails.model";
import { Bicycle } from "../modules/bicycles/bicycle.model";
import { Brand } from "../modules/brands/brand.model";
import { Customer } from "../modules/customers/customer.model";
import { Order } from "../modules/orders/order.model";

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
    BicycleDetails.hasOne(Bicycle, { foreignKey: "bicycleId", as: "bicyclesDetails" });

    // Customer 1:N Order
    Customer.hasMany(Order, { foreignKey: "customerId", as: "orders", onDelete: "RESTRICT" });
    Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
}