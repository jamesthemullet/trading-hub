import { render } from '@testing-library/react';

import { SortableRow } from './sortable-row';

const mockUseSortable = jest.fn();

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: (...args: unknown[]) => mockUseSortable(...args),
}));

describe('FacetAttributeSortableRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes sortable props (dragging) to children', () => {
    mockUseSortable.mockReturnValue({
      attributes: { role: 'button' },
      listeners: { onPointerDown: jest.fn() },
      setActivatorNodeRef: jest.fn(),
      setNodeRef: jest.fn(),
      transform: { x: 12, y: -8 },
      transition: 'ease 200ms',
      isDragging: true,
    });

    const child = jest.fn(() => <div data-testid="sortable" />);

    render(
      <SortableRow id="row-1" disabled={false}>
        {child}
      </SortableRow>
    );

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: 'row-1',
      disabled: false,
    });
    expect(child).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: { role: 'button' },
        listeners: expect.objectContaining({
          onPointerDown: expect.any(Function),
        }),
        setActivatorNodeRef: expect.any(Function),
        setNodeRef: expect.any(Function),
        style: {
          transform: 'translate3d(12px, -8px, 0)',
          transition: 'ease 200ms',
          zIndex: 10,
        },
      })
    );
  });

  it('omits transform and z-index when not dragging and no transform provided', () => {
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setActivatorNodeRef: jest.fn(),
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    });

    const child = jest.fn(() => <div />);

    render(
      <SortableRow id="row-2" disabled>
        {child}
      </SortableRow>
    );

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: 'row-2',
      disabled: true,
    });
    expect(child).toHaveBeenCalledWith(
      expect.objectContaining({
        style: {
          transform: undefined,
          transition: undefined,
          zIndex: undefined,
        },
      })
    );
  });
});
