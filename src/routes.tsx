import { Routes as Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Cart from './pages/Cart';
import { AuthCart } from './pages/private/AuthCart';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route index element={<Home />} />
      <Route
        path='/cart'
        element={
          <AuthCart>
            <Cart />
          </AuthCart>
        }
      />
    </Switch>
  );
};

export default Routes;
