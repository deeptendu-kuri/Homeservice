import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(100).trim().allow('').optional(),
  category: Joi.string().allow('').optional().custom((value, helpers) => {
    if (!value || value === '') return value;
    
    // Map of lowercase/alternate names to proper category names
    const categoryMap: Record<string, string> = {
      'cleaning': 'Cleaning',
      'beauty': 'Beauty & Personal Care',
      'beauty & personal care': 'Beauty & Personal Care',
      'health': 'Health & Wellness',
      'health & wellness': 'Health & Wellness',
      'home': 'Home Services',
      'home services': 'Home Services',
      'home-services': 'Home Services',
      'education': 'Education',
      'technology': 'Technology',
      'tech': 'Technology',
      'automotive': 'Automotive',
      'auto': 'Automotive',
      'pet care': 'Pet Care',
      'pet-care': 'Pet Care',
      'petcare': 'Pet Care',
      'fitness': 'Fitness',
      'events': 'Events',
      'event': 'Events',
      'event planning': 'Events',
      'event-planning': 'Events'
    };

    const lowerValue = value.toLowerCase();
    const mappedCategory = categoryMap[lowerValue];
    
    if (mappedCategory) {
      return mappedCategory;
    }
    
    // Check if it's already a valid category (exact match)
    const validCategories = [
      'Cleaning', 'Beauty & Personal Care', 'Health & Wellness',
      'Home Services', 'Education', 'Technology', 'Automotive',
      'Pet Care', 'Fitness', 'Events'
    ];
    
    if (validCategories.includes(value)) {
      return value;
    }
    
    return helpers.error('any.invalid', { 
      message: `"${value}" is not a valid category. Valid categories are: ${validCategories.join(', ')}`
    });
  }),
  subcategory: Joi.string().max(50).trim().optional(),
  minPrice: Joi.number().min(0).max(10000).optional(),
  maxPrice: Joi.number().min(0).max(10000).optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(100).default(25),
  city: Joi.string().max(50).trim().allow('').optional(),
  state: Joi.string().max(50).trim().allow('').optional(),
  zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).optional().messages({
    'string.pattern.base': 'Invalid zip code format'
  }),
  sortBy: Joi.string().valid(
    'popularity',
    'price',
    'price_desc',
    'rating',
    'distance',
    'newest'
  ).default('popularity'),
  page: Joi.number().integer().min(1).max(100).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().optional(),
  instantBooking: Joi.boolean().optional(),
  availableToday: Joi.boolean().optional()
}).custom((value, helpers) => {
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.error('custom.minMaxPrice', { 
      message: 'minPrice cannot be greater than maxPrice' 
    });
  }
  
  if ((value.lat && !value.lng) || (!value.lat && value.lng)) {
    return helpers.error('custom.coordinates', { 
      message: 'Both latitude and longitude are required for location search' 
    });
  }
  
  if (value.q && value.q.trim() && value.q.trim().length < 2) {
    return helpers.error('custom.searchQuery', { 
      message: 'Search query must be at least 2 characters long' 
    });
  }
  
  return value;
}).messages({
  'custom.minMaxPrice': 'minPrice cannot be greater than maxPrice',
  'custom.coordinates': 'Both latitude and longitude are required for location search',
  'custom.searchQuery': 'Search query must be at least 2 characters long'
});

const suggestionQuerySchema = Joi.object({
  q: Joi.string().min(1).max(50).trim().required(),
  category: Joi.string().valid(
    'Cleaning',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Home Services',
    'Education',
    'Technology',
    'Automotive',
    'Pet Care',
    'Fitness',
    'Events'
  ),
  limit: Joi.number().integer().min(1).max(10).default(5)
});

const categoryParamSchema = Joi.object({
  category: Joi.string().valid(
    'Cleaning',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Home Services',
    'Education',
    'Technology',
    'Automotive',
    'Pet Care',
    'Fitness',
    'Events'
  ).required()
});

export const validateSearchQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = searchQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errorMessages,
      timestamp: new Date().toISOString()
    });
    return;
  }

  req.query = value;
  next();
};

export const validateSuggestionQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = suggestionQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errorMessages,
      timestamp: new Date().toISOString()
    });
    return;
  }

  req.query = value;
  next();
};

export const validateCategoryParam = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = categoryParamSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errorMessages,
      timestamp: new Date().toISOString()
    });
    return;
  }

  req.params = value;
  next();
};

export const validateServiceId = (req: Request, res: Response, next: NextFunction): void => {
  const serviceIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
  
  const { error } = serviceIdSchema.validate(req.params.id);

  if (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid service ID format',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};