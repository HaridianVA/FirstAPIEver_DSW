
import { BicycleDetails } from "../modules/bicycleDetails/bicycleDetails.model";
import { Bicycle } from "../modules/bicycles/bicycle.model";
import { Brand } from "../modules/brands/brand.model";
import {Customer} from "../modules/customers/customer.model"

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
    BicycleDetails.hasOne(Bicycle, { foreignKey: "bicycleId", as: "bicyclesDetails" });
    Customer.hasMany(Bicycle, { foreignKey: "id", as: "customer" });
}