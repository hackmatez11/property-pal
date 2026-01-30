import { Response, NextFunction } from 'express';
import PropertyService from '../services/property.service';
import { createSuccessResponse, formatPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { PropertyFilters, PaginationOptions } from '../types';

export class PropertyController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dealerId = req.user!.id;
      const propertyData = req.body;

      const property = await PropertyService.createProperty(dealerId, propertyData);

      res.status(201).json(createSuccessResponse(property));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dealerId = req.user!.id;
      const updates = req.body;

      const property = await PropertyService.updateProperty(id, dealerId, updates);

      res.json(createSuccessResponse(property));
    } catch (error) {
      next(error);
    }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const property = await PropertyService.getProperty(id, userId);

      res.json(createSuccessResponse(property));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: PropertyFilters = {
        city: req.query.city as string,
        state: req.query.state as string,
        property_type: req.query.property_type as any,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        min_size: req.query.min_size ? parseFloat(req.query.min_size as string) : undefined,
        max_size: req.query.max_size ? parseFloat(req.query.max_size as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string, 10) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string, 10) : undefined,
      };

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const { properties, total } = await PropertyService.listProperties(
        filters,
        pagination,
        req.user?.id,
        req.user?.role
      );

      res.json(
        createSuccessResponse(
          properties,
          formatPaginationMeta(pagination.page, pagination.limit, total)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dealerId = req.user!.id;

      await PropertyService.deleteProperty(id, dealerId);

      res.json(createSuccessResponse({ message: 'Property deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }

  async getDealerProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dealerId = req.user!.id;

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
      };

      const { properties, total } = await PropertyService.getDealerProperties(
        dealerId,
        pagination
      );

      res.json(
        createSuccessResponse(
          properties,
          formatPaginationMeta(pagination.page, pagination.limit, total)
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new PropertyController();
