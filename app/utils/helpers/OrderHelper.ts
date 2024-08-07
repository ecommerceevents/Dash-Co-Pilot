interface OrderableItem {
  order: number;
}

function getNextOrder(items: OrderableItem[]) {
  return (items.length > 0 ? Math.max(...items.map((o) => o.order)) : 0) + 1;
}

export default {
  getNextOrder,
};
