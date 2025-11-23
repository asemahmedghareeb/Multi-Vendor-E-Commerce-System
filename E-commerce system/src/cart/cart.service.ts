import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { I18nService } from 'nestjs-i18n';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,

    private readonly i18n: I18nService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'user', 'items.product', 'items.product.vendor'],
      order: { items: { createdAt: 'ASC' } },
    });

    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(this.i18n.t('events.product.NOT_FOUND'));
      }

      cart = this.cartRepo.create({ user: user, items: [] });
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, input: AddToCartInput): Promise<Cart> {

    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });


    if (!cart) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('events.auth.USER_NOT_FOUND');
      }
      cart = this.cartRepo.create({
        user: user,
        items: [],
        totalAmount: 0, 
      });
      await this.cartRepo.save(cart);
    }


    const product = await this.productRepo.findOne({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundException('events.product.NOT_FOUND');
    }


    let cartItem = cart.items.find(
      (item) => item.product.id === input.productId,
    );

    if (cartItem) {
      const newQuantity = cartItem.quantity + input.quantity;

      if (product.inventoryCount < newQuantity) {
        throw new BadRequestException({
          key: 'events.product.INSUFFICIENT_INVENTORY',
          args: { count: product.inventoryCount },
        });
      }

      cartItem.quantity = newQuantity;
      await this.cartItemRepo.save(cartItem);
    } else {
      
      if (product.inventoryCount < input.quantity) {
        throw new BadRequestException({
          key: 'events.product.INSUFFICIENT_INVENTORY',
          args: { count: product.inventoryCount },
        });
      }

      cartItem = this.cartItemRepo.create({
        cart,
        product,
        quantity: input.quantity,
      });

      await this.cartItemRepo.save(cartItem);

      cart.items.push(cartItem);
    }

    
    cart.totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    await this.cartRepo.save(cart);

    return cart;
  }


  async updateCartItem(
    userId: string,
    input: UpdateCartItemInput,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const cartItem = await this.cartItemRepo.findOne({
      where: { id: input.cartItemId, cart: { id: cart.id } },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(this.i18n.t('events.cart.ITEM_NOT_FOUND'));
    }

    if (cartItem.product.inventoryCount < input.quantity) {
      throw new BadRequestException({
        key: this.i18n.t('events.product.INSUFFICIENT_INVENTORY'),
        args: { count: cartItem.product.inventoryCount },
      });
    }

    cartItem.quantity = input.quantity;
    await this.cartItemRepo.save(cartItem);
    return this.getCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const result = await this.cartItemRepo.delete({
      id: cartItemId,
      cart: { id: cart.id },
    });

    if (result.affected === 0)
      throw new NotFoundException(this.i18n.t('events.cart.ITEM_NOT_FOUND'));

    return this.getCart(userId);
  }
}
