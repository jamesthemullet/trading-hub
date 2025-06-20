import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CountryFilterDropdown } from './country-filter-dropdown';

const meta: Meta<typeof CountryFilterDropdown> = {
  title: 'Components/Dropdowns/Country Filter Dropdown',
  component: CountryFilterDropdown,
  tags: ['autodocs'],
  argTypes: {
    onChange: {
      action: 'onChange',
      description: 'Callback triggered when a country is selected',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CountryFilterDropdown>;

export const Default: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => <CountryFilterDropdown {...args} />,
};
