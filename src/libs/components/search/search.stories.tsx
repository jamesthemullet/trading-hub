import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Search } from './search';

const meta: Meta<typeof Search> = {
  title: 'Components/Search',
  component: Search,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    name: 'search',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search category identifier or user name',
    name: 'search',
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'Search...',
    name: 'search',
    fullWidth: true,
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search...',
    name: 'search',
    value: 'Product search term',
  },
};

export const LongSearchTerm: Story = {
  args: {
    placeholder: 'Search...',
    name: 'search',
    value: 'This is a very long search term that tests text overflow behavior',
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState('');

  return (
    <div>
      <Search
        placeholder="Type to search..."
        name="controlled-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Current value: &quot;{value}&quot;
      </p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const FullWidthWithValue: Story = {
  args: {
    placeholder: 'Search...',
    name: 'search',
    fullWidth: true,
    value: 'Example search',
  },
};
