import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";
import { ORDER_STATUSES } from "./order.model";

export class OrderController {

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const orders = await OrderService.findAll();

      res.json(orders);
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

      const order = await OrderService.findById(id);

      if (!order) {
        res.status(404).json({
          message: "Pedido no encontrado",
        });

        return;
      }

      res.json(order);

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

      const order = await OrderService.findEagerById(id);

      if (!order) {
        res.status(404).json({
          message: "Pedido no encontrado",
        });

        return;
      }

      res.json(order);

    } catch (error) {
      next(error);
    }
  }


  static async getByCustomerId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customerId = Number(req.params.id);

      const orders = await OrderService.findByCustomerId(customerId);

      res.json(orders);

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
      const { customerId, orderDate, status } = req.body;

      if (!customerId) {
        res.status(400).json({
          message: "customerId es obligatorio",
        });

        return;
      }

      if (status !== undefined && !ORDER_STATUSES.includes(status)) {
        res.status(400).json({
          message: `status debe ser uno de: ${ORDER_STATUSES.join(", ")}`,
        });

        return;
      }

      const order = await OrderService.create({
        customerId,
        orderDate,
        status,
      });

      res.status(201).json(order);

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

      const order = await OrderService.findById(id);

      if (!order) {
        res.status(404).json({
          message: "Pedido no encontrado",
        });

        return;
      }

      const { customerId, orderDate, status } = req.body;

      if (status !== undefined && !ORDER_STATUSES.includes(status)) {
        res.status(400).json({
          message: `status debe ser uno de: ${ORDER_STATUSES.join(", ")}`,
        });

        return;
      }

      const updatedOrder = await OrderService.update(order, {
        customerId,
        orderDate,
        status,
      });

      res.json(updatedOrder);

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

      const order = await OrderService.findById(id);

      if (!order) {
        res.status(404).json({
          message: "Pedido no encontrado",
        });

        return;
      }

      await OrderService.delete(order);

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }
}