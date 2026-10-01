import { Request, Response, NextFunction } from "express";
import { BicycleDetailsService } from "./bicycleDetails.service";

export class bicycleDetailsController {

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const bicycleDetails = await BicycleDetailsService.findAll();

      res.json(bicycleDetails);
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

      const bicycleDetails = await BicycleDetailsService.findById(id);

      if (!bicycleDetails) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      res.json(bicycleDetails);

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
      const { bicycleId, frameMaterial, wheelSize, weight, suspension, createdAt, updatedAt} = req.body;

      if (!bicycleId === undefined) {
        res.status(400).json({
          message: "id de la bici es obligatorio",
        });

        return;
      }

      const bicycleDetails = await BicycleDetailsService.create({
        bicycleId,
        frameMaterial,
        wheelSize,
        weight,
        suspension,
        createdAt,
        updatedAt
      });

      res.status(201).json(bicycleDetails);

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

      const bicycleDetails = await BicycleDetailsService.findById(id);

      if (!bicycleDetails) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      const updatedbicycleDetails = await BicycleDetailsService.update(
        bicycleDetails,
        req.body
      );

      res.json(updatedbicycleDetails);

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

      const bicycleDetails = await BicycleDetailsService.findById(id);

      if (!bicycleDetails) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      await BicycleDetailsService.delete(bicycleDetails);

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }

  static async getEagerlyById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const bicycleDetails = await BicycleDetailsService.findEagerById(id);

    if (!bicycleDetails) {
      res.status(404).json({
        message: "bicycleDetails not found",
      });

      return;
    }

    res.json(bicycleDetails);
  } catch (error) {
    next(error);
  }
}
}