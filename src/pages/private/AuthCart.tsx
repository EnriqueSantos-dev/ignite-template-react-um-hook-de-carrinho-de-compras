import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export function AuthCart({ children }: { children: ReactNode }) {
  const { cart } = useCart();

  if (cart.length === 0) {
    return <Navigate to='/' />;
  }
  return <>{children}</>;
}
