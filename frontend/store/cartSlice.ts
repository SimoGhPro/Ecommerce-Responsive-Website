import { createSlice } from '@reduxjs/toolkit';
import { Product } from '../../backend/sanity.types';

interface CartItem extends Omit<Product, '_type' | '_createdAt' | '_updatedAt' | '_rev'> {
  quantity: number;
  totalPrice: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const loadCartFromLocalStorage = (): CartState => {
  if (typeof window !== 'undefined') {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : { items: [], totalQuantity: 0, totalAmount: 0 };
  }
  return { items: [], totalQuantity: 0, totalAmount: 0 };
};

const saveCartToLocalStorage = (cart: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

const initialState: CartState = loadCartFromLocalStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action: { payload: Product }) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item._id === newItem._id);
      
      // Calculate available inventory
      const inventory = newItem.inventory?.ourInventory ?? 
                       Math.floor((newItem.inventory?.quantity ?? 0) / 2);
      
      // Check if product is out of stock
      if (inventory <= 0) return;
      
      // Check if we're trying to add more than available
      if (existingItem && existingItem.quantity >= inventory) return;
      
      const price = newItem.price?.salePrice ?? 
                   (newItem.price?.priceExclVAT ?? 0) * 1.2;
      const discountPrice = newItem.price?.specialSalePrice ?? 
                          (newItem.price?.specialPrice ?? 0) * 1.2;
      
      state.totalQuantity++;
      state.totalAmount += discountPrice || price;
      
      if (!existingItem) {
        state.items.push({
          ...newItem,
          quantity: 1,
          totalPrice: discountPrice || price,
          maxQuantity: inventory
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += discountPrice || price;
      }
      saveCartToLocalStorage(state);
    },
    removeItemFromCart(state, action: { payload: string }) {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);
      
      if (!existingItem) return;
      
      state.totalQuantity -= existingItem.quantity;
      state.totalAmount -= existingItem.totalPrice;
      state.items = state.items.filter(item => item._id !== id);
      
      saveCartToLocalStorage(state);
    },
    decreaseItemQuantity(state, action: { payload: string }) {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);
      
      if (!existingItem) return;
      
      const price = existingItem.price?.salePrice ?? 
                   (existingItem.price?.priceExclVAT ?? 0) * 1.2;
      const discountPrice = existingItem.price?.specialSalePrice ?? 
                          (existingItem.price?.specialPrice ?? 0) * 1.2;
      
      state.totalQuantity--;
      state.totalAmount -= discountPrice || price;
      
      if (existingItem.quantity === 1) {
        state.items = state.items.filter(item => item._id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice -= discountPrice || price;
      }
      saveCartToLocalStorage(state);
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      saveCartToLocalStorage(state);
    }
  },
});

export const { addItemToCart, removeItemFromCart, decreaseItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;