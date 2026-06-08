import { render } from '@testing-library/react';

import { ChevronIcon } from './chevron-icon';

describe('ChevronIcon', () => {
  it('should render the chevron icon', () => {
    const { container } = render(<ChevronIcon type="prev" />);
    expect(container.getElementsByTagName('path')).toHaveLength(1);
  });

  it('should render the chevron icon with the prev type', () => {
    const { container } = render(<ChevronIcon type="prev" />);
    expect(container.getElementsByTagName('path')[0]).toHaveAttribute(
      'd',
      'M19 23L12 16.5L19 10'
    );
  });

  it('should render the chevron icon with the next type', () => {
    const { container } = render(<ChevronIcon type="next" />);
    expect(container.getElementsByTagName('path')[0]).toHaveAttribute(
      'd',
      'M13 10L20 16.5L13 23'
    );
  });
});
