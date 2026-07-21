import { z } from 'zod';

export function validateId(paramName = 'id') {
  return (req, res, next) => {
    const result = z.coerce.number().int().positive().safeParse(req.params[paramName]);
    if (!result.success) {
      return res.status(400).json({ message: `ID de ${paramName} inválido.` });
    }
    req.params[paramName] = result.data;
    next();
  };
}
