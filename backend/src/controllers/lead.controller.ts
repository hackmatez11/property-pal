import { Response, NextFunction } from 'express';
import LeadService from '../services/lead.service';
import { createSuccessResponse, formatPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { PaginationOptions } from '../types';

export class LeadController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const leadData = req.body;

      const lead = await LeadService.createLead(leadData);

      res.status(201).json(createSuccessResponse(lead));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dealerId = req.user!.id;
      const propertyId = req.query.property_id as string;

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
      };

      const { leads, total } = await LeadService.getDealerLeads(
        dealerId,
        pagination,
        propertyId
      );

      res.json(
        createSuccessResponse(
          leads,
          formatPaginationMeta(pagination.page, pagination.limit, total)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const dealerId = req.user!.id;

      const lead = await LeadService.updateLeadStatus(id, dealerId, status);

      res.json(createSuccessResponse(lead));
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dealerId = req.user!.id;

      const analytics = await LeadService.getLeadAnalytics(dealerId);

      res.json(createSuccessResponse(analytics));
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
