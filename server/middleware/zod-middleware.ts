import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware that validates the request body against a Zod schema.
 * If validation fails, a 400 response is sent with the validation errors.
 * If validation succeeds, the validated data is attached to the request object.
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      // Attach the validated data to the request
      req.body = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.format(),
        });
      }
      return res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}

/**
 * Middleware that validates the request params against a Zod schema.
 * If validation fails, a 400 response is sent with the validation errors.
 * If validation succeeds, the validated data is attached to the request object.
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.params);
      // Attach the validated data to the request params
      req.params = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error in URL parameters',
          details: error.format(),
        });
      }
      return res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}

/**
 * Middleware that validates the request query against a Zod schema.
 * If validation fails, a 400 response is sent with the validation errors.
 * If validation succeeds, the validated data is attached to the request object.
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.query);
      // Attach the validated data to the request query
      req.query = data as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error in query parameters',
          details: error.format(),
        });
      }
      return res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
}