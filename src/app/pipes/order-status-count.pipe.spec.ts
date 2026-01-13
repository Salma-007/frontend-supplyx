import { OrderStatusCountPipe } from './order-status-count.pipe';

describe('OrderStatusCountPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderStatusCountPipe();
    expect(pipe).toBeTruthy();
  });
});
