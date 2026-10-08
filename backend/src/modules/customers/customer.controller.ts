import { Request, Response, NextFunction } from "express";
import { CustomerService } from "./customer.service";

export class customerController {

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customers = await CustomerService.findAll();

      res.json(customers);
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

      const customer = await CustomerService.findById(id);

      if (!customer) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      res.json(customer);

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
      const { id, name, email, createdAt, updatedAt } = req.body;

      if (!id || !name || email === undefined) {
        res.status(400).json({
          message: "nombre, id e email son obligatorios",
        });

        return;
      }

      const customer = await CustomerService.create({
        id,
        name,
        email,
        createdAt,
        updatedAt,
      });

      res.status(201).json(customer);

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

      const customer = await CustomerService.findById(id);

      if (!customer) {
        res.status(404).json({
          message: "cliente no encontrada",
        });

        return;
      }

      const updatedcustomer = await CustomerService.update(
        customer,
        req.body
      );

      res.json(updatedcustomer);

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

      const customer = await CustomerService.findById(id);

      if (!customer) {
        res.status(404).json({
          message: "Bicicleta no encontrada",
        });

        return;
      }

      await CustomerService.delete(customer);

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

    const customer = await CustomerService.findEagerById(id);

    if (!customer) {
      res.status(404).json({
        message: "customer not found",
      });

      return;
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
}
}