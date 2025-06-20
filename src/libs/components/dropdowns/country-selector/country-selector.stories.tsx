import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CountrySelectorDropdown } from './country-selector';

const meta: Meta<typeof CountrySelectorDropdown> = {
  title: 'Components/Dropdowns/CountrySelectorDropdown',
  component: CountrySelectorDropdown,
  tags: ['autodocs'],
  argTypes: {
    onChange: {
      action: 'onChange',
      description: 'Invoked when the user selects a different country code',
    },
    selectedCountryCode: {
      control: 'text',
      description: 'Current selected country code',
    },
    writeEnabled: {
      control: 'boolean',
      description: 'Whether the dropdown is interactive or disabled',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CountrySelectorDropdown>;

export const Default: Story = {
  args: {
    selectedCountryCode: 'UK_IE',
    writeEnabled: true,
    onChange: fn(),
  },
  render: (args) => {
    const [countryCode, setCountryCode] = useState(args.selectedCountryCode);

    return (
      <CountrySelectorDropdown
        {...args}
        selectedCountryCode={countryCode}
        onChange={(newCode) => {
          setCountryCode(newCode);
          args.onChange?.(newCode);
        }}
      />
    );
  },
};
