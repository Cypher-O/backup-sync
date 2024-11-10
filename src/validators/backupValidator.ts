import { object, string } from 'zod';

export const dataSchema = object({
  data: string().nonempty("Data is required for backup"),
});
