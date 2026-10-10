// lib/storeCart.ts

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  currency: string;
  stockQuantity: number;
};

const CART_KEY = "olatinnCart";
const CART_EVENT = "olatinn-cart-updated";

export const CART_UPDATED_EVENT = CART_EVENT;

const notifyCartUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_EVENT));
  }
};

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedCart = localStorage.getItem(CART_KEY);

    if (!storedCart) return [];

    const parsedCart: unknown = JSON.parse(storedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Unable to read shopping cart:", error);
    return [];
  }
};

const saveCart = (cart: CartItem[]): CartItem[] => {
  if (typeof window === "undefined") return cart;

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartUpdated();

  return cart;
};

export const addToCart = (
  item: Omit<CartItem, "quantity">
): CartItem[] => {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.storeId === item.storeId
  );

  if (existingItem) {
    const nextQuantity = existingItem.quantity + 1;

    existingItem.quantity =
      existingItem.stockQuantity > 0
        ? Math.min(nextQuantity, existingItem.stockQuantity)
        : nextQuantity;

    return saveCart([...cart]);
  }

  return saveCart([
    ...cart,
    {
      ...item,
      quantity: 1,
    },
  ]);
};

export const updateCartQuantity = (
  productId: string,
  storeId: string,
  quantity: number
): CartItem[] => {
  const cart = getCart();

  const updatedCart = cart.map((item) => {
    if (
      item.productId !== productId ||
      item.storeId !== storeId
    ) {
      return item;
    }

    const requestedQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    const safeQuantity =
      item.stockQuantity > 0
        ? Math.min(requestedQuantity, item.stockQuantity)
        : requestedQuantity;

    return {
      ...item,
      quantity: safeQuantity,
    };
  });

  return saveCart(updatedCart);
};

export const removeFromCart = (
  productId: string,
  storeId: string
): CartItem[] => {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) =>
      !(
        item.productId === productId &&
        item.storeId === storeId
      )
  );

  return saveCart(updatedCart);
};

export const clearCart = (): CartItem[] => {
  return saveCart([]);
};

export const getCartItemCount = (): number => {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
};