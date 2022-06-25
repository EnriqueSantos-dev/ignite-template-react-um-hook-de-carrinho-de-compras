import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import { setLocalStorage } from '../util/setLocalStorage';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartTemp = [...cart];
      const productExits = cartTemp.find(item => item.id === productId);

      const stock = await api.get<Product>(`stock/${productId}`);
      const stockAmount = stock.data.amount;

      const currentAmount = productExits?.amount ? productExits.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (productExits && amount <= stockAmount) {
        productExits.amount++;
      }
      if (!productExits) {
        const productItem = await api.get<Product>(`products/${productId}`);
        const newProduct = { ...productItem.data, amount: 1 };
        cartTemp.push(newProduct);
      }

      setCart(cartTemp);
      setLocalStorage(cartTemp);
    } catch (e) {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updateCart = [...cart];
      const itemExists = updateCart.findIndex(item => item.id === productId);

      if (itemExists != -1) {
        updateCart.splice(itemExists, 1);
        setCart(updateCart);
        setLocalStorage(updateCart);
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updateCart = [...cart];
      const product = updateCart.find(item => {
        return item.id === productId;
      });

      const itemStockExists = await api.get<Stock>(`stock/${productId}`);
      const itemStockQt = itemStockExists.data.amount;

      if (amount <= 0) {
        return;
      }

      if (itemStockQt < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (itemStockExists && product) {
        product.amount = amount;
      }

      setCart(updateCart);
      setLocalStorage(updateCart);
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  return context;
}
