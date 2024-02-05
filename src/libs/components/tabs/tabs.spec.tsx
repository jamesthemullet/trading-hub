import { act, render, screen } from '@testing-library/react';

import { Tabs } from './tabs';

describe('Tabs', () => {
  it('should render correctly', () => {
    render(
      <Tabs tabs={['Tab 1', 'Tab 2']} currentTab={0} onTabChange={jest.fn()} />
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('should click on second tab', async () => {
    const mockTabClick = jest.fn();
    render(
      <Tabs
        tabs={['Tab 1', 'Tab 2']}
        currentTab={0}
        onTabChange={mockTabClick}
      />
    );

    const tab2 = await screen.findByText('Tab 2');

    act(() => {
      tab2.click();
    });

    expect(mockTabClick).toHaveBeenCalledWith(1);
  });

  it('does not call click handler on current tab', async () => {
    const mockTabClick = jest.fn();
    render(
      <Tabs
        tabs={['Tab 1', 'Tab 2']}
        currentTab={0}
        onTabChange={mockTabClick}
      />
    );

    const tab1 = await screen.findByText('Tab 1');

    act(() => {
      tab1.click();
    });

    expect(mockTabClick).not.toHaveBeenCalled();
  });
});
