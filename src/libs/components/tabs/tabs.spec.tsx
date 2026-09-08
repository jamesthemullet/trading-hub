import { act, render, screen } from '@testing-library/react';

import { Tabs } from './tabs';

describe('Tabs', () => {
  it('should render correctly', () => {
    render(
      <Tabs
        tabs={[{ title: 'Tab 1' }, { title: 'Tab 2', count: 10 }]}
        currentTab={0}
        onTabChange={jest.fn()}
      />
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('should click on second tab', async () => {
    const mockTabClick = jest.fn();
    render(
      <Tabs
        tabs={[{ title: 'Tab 1' }, { title: 'Tab 2', count: 10 }]}
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
        tabs={[{ title: 'Tab 1' }, { title: 'Tab 2', count: 10 }]}
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

  it('should set data-tabs attribute based on number of tabs', () => {
    const { container } = render(
      <Tabs
        tabs={[{ title: 'Tab 1' }, { title: 'Tab 2' }]}
        currentTab={0}
        onTabChange={jest.fn()}
      />
    );

    const wrapper = container.querySelector('[class*="tabsWrapper"]');
    expect(wrapper).toHaveAttribute('data-tabs', '2');
  });

  it('should render icons next to a tab when provided', () => {
    const { container } = render(
      <Tabs
        tabs={[
          {
            title: 'marksandspencer.com',
            icons: [
              '/trading-hub/asset/icon-uk-flag.svg',
              '/trading-hub/asset/icon-ie-flag.svg',
            ],
          },
          { title: 'cfto.com' },
        ]}
        currentTab={0}
        onTabChange={jest.fn()}
      />
    );

    expect(container.querySelectorAll('img')).toHaveLength(2);
  });
});
