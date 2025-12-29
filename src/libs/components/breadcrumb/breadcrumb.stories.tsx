import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Typography } from '../typography/typography';
import { Breadcrumb } from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const TwoLinks: Story = {
  render: () => (
    <Breadcrumb>
      <Typography as="span" variant="bodySmall">
        Search & Merchandising
      </Typography>
      <Typography as="span" variant="bodySmall">
        Site search
      </Typography>
    </Breadcrumb>
  ),
};

export const ThreeLinks: Story = {
  render: () => (
    <Breadcrumb>
      <Typography as="span" variant="bodySmall">
        Search & Merchandising
      </Typography>
      <Typography as="span" variant="bodySmall">
        Site search
      </Typography>
      <Typography as="span" variant="bodySmall">
        Ranking rules
      </Typography>
    </Breadcrumb>
  ),
};
