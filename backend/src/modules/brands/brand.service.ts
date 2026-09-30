
import { Brand } from "./brand.model";

export class BrandService {

  static async findAll() {
    return Brand.findAll({
      order: [["id", "ASC"]],
    });
  }

  static async findById(id: number) {
    return Brand.findByPk(id);
  }

  static async create(data: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return Brand.create(data as any);
  }

  static async update(
    Brand: Brand,
    data: {
      id?: number;
      name?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    return Brand.update(data);
  }

  static async delete(Brand: Brand) {
    await Brand.destroy();
  }
}
