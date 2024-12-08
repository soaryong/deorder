export interface IOrderProps {
  id: string;
  store_id: string;
  price: string;
  customer: string;
  state: string;
  created: string;
  requestId: string;
  hash: string;
  menus: {
    menu: string;
    price: string;
    count: string;
    menu2: string;
    price2: string;
    count2: string;
    tip: string;
  };
}
