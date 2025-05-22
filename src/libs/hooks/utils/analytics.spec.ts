import { track } from './analytics';

describe('analytics', () => {
  it('should track events', () => {
    const mockCall = jest.fn();
    Object.defineProperty(window, 'clarity', {
      value: mockCall,
    });
    track({ event: 'mock event' });

    expect(mockCall).toHaveBeenCalledWith('event', 'mock event');
  });
});
