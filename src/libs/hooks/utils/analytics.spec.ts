import { track } from './analytics';

describe('analytics', () => {
  it('should track clarity events', () => {
    const mockCall = jest.fn();
    Object.defineProperty(window, 'clarity', {
      value: mockCall,
    });
    track({ event: 'mock event' });

    expect(mockCall).toHaveBeenCalledWith('event', 'mock event');
  });

  it('should track umami events', () => {
    const mockCall = jest.fn();
    Object.defineProperty(window, 'umami', {
      value: {
        track: mockCall,
      },
    });
    track({ event: 'mock event' });

    expect(mockCall).toHaveBeenCalledWith('mock event');
  });
});
