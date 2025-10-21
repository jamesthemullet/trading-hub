import { fireEvent, render, screen } from '@testing-library/react';

import { FACET_ATTRIBUTE_VIEW_MODE } from '@/libs/utils/facet-attribute-types';

import { FacetAttributesActions } from './facet-attributes-actions';

describe('FacetAttributesActions', () => {
  it('renders the component with default props', () => {
    const setCurrentModeMock = jest.fn();

    render(
      <FacetAttributesActions
        currentMode={FACET_ATTRIBUTE_VIEW_MODE.LIST}
        setCurrentMode={setCurrentModeMock}
      />
    );

    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument();
  });

  it('calls setCurrentMode with LIST when List button is clicked', () => {
    const setCurrentModeMock = jest.fn();

    render(
      <FacetAttributesActions
        currentMode={FACET_ATTRIBUTE_VIEW_MODE.GRID}
        setCurrentMode={setCurrentModeMock}
      />
    );

    const listButton = screen.getByRole('button', { name: 'List' });
    fireEvent.click(listButton);

    expect(setCurrentModeMock).toHaveBeenCalledWith(
      FACET_ATTRIBUTE_VIEW_MODE.LIST
    );
  });

  it('calls setCurrentMode with GRID when Grid button is clicked', () => {
    const setCurrentModeMock = jest.fn();

    render(
      <FacetAttributesActions
        currentMode={FACET_ATTRIBUTE_VIEW_MODE.LIST}
        setCurrentMode={setCurrentModeMock}
      />
    );

    const gridButton = screen.getByRole('button', { name: 'Grid' });
    fireEvent.click(gridButton);

    expect(setCurrentModeMock).toHaveBeenCalledWith(
      FACET_ATTRIBUTE_VIEW_MODE.GRID
    );
  });
});
