import { validationResult } from 'express-validator';
import { ApiError } from '../utils/http.js';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().reduce((map, item) => ({ ...map, [item.path]: item.msg }), {});
    return next(new ApiError(422, 'Vui lòng kiểm tra lại thông tin', details));
  }
  next();
}
