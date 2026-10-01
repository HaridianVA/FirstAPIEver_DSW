import { BicycleDetails } from "./bicycleDetails.model";
import { Brand } from "../brands/brand.model";

export class BicycleDetailsService {

    static async findAll() {
        return BicycleDetails.findAll({
            order: [["id", "ASC"]],
        });
    }


    static async findById(id: number) {
        return BicycleDetails.findByPk(id);
    }


    static async create(data: {
        bicycleId: number;

        frameMaterial: "Aluminium" | "carbon" | "steel" | "titanium";

        wheelSize: number;

        weight: number;

        suspension:String | null;

        createdAt: Date;

        updatedAt: Date
    }) {
        return BicycleDetails.create(data);
    }


    static async update(
        BicycleDetails: BicycleDetails,
        data: {
            brandId: number;
            model: string;
            description?: string | null;
            price?: number;
            stock?: number;
        }
    ) {
        return BicycleDetails.update(data);
    }


    static async delete(BicycleDetails: BicycleDetails) {
        await BicycleDetails.destroy();
    }

    static async findEagerById(id: number) {
        return BicycleDetails.findByPk(id, {
            include: [
                {
                    model: Brand,
                    as: "brand"
                }
            ]
        });
    }
}