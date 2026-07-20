import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name is required').max(80)
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().max(60).optional().or(z.literal('')),
  price: z.coerce.number().positive(),
  inventory: z.coerce.number().int().nonnegative()
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive()
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2).max(120),
  shippingEmail: z.string().email(),
  shippingAddress: z.string().min(10).max(300),
  items: z.array(cartItemSchema).min(1)
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
});
