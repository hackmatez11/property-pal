import { Request, Response, NextFunction } from 'express';
import AIService from '../services/ai.service';
import { createSuccessResponse } from '../utils/response';

export class AIController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, context } = req.body;

      const result = await AIService.searchProperties(query, context);

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      const suggestions = await AIService.getSuggestions(q as string);

      res.json(createSuccessResponse(suggestions));
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();
