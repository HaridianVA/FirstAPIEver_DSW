import { Request, Response, NextFunction } from "express";
import { BrandService } from "./brand.service";

export class brandController {

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const brands = await BrandService.findAll();

      res.json(brands);
    } catch (error) {
      next(error);
    }
  }


  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const brand = await BrandService.findById(id);

      if (!brand) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      res.json(brand);

    } catch (error) {
      next(error);
    }
  }


  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id, name, createdAt, updatedAt } = req.body;

      if ( !name === undefined) {
        res.status(400).json({
          message: "brandId y nombre son obligatorios",
        });

        return;
      }

      const brand = await BrandService.create({
        id,
        name,
        createdAt,
        updatedAt
      });

      res.status(201).json(brand);

    } catch (error) {
      next(error);
    }
  }


  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const brand = await BrandService.findById(id);

      if (!brand) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      const updatedbrand = await BrandService.update(
        brand,
        req.body
      );

      res.json(updatedbrand);

    } catch (error) {
      next(error);
    }
  }


  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);

      const brand = await BrandService.findById(id);

      if (!brand) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      await BrandService.delete(brand);

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }
}