import { useState } from 'react';
import type { DatePickerProps } from '@mantine/dates';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DatePicker } from './date-picker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Date Picker/Range',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: false,
      description: 'Selected start and end dates',
    },
    onChange: {
      description: 'Fires when the date range changes',
      table: { disable: true },
    },
    startTime: {
      control: 'text',
      description: 'Selected start time',
    },
    endTime: {
      control: 'text',
      description: 'Selected end time',
    },
    setStartTime: {
      table: { disable: true },
    },
    setEndTime: {
      table: { disable: true },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;
type DateRangeValue = [Date | null, Date | null];

const normalizeRangeValue = (
  range?: DatePickerProps<'range'>['value'] | DateRangeValue
): DateRangeValue => {
  return [
    range?.[0] ? new Date(range[0]) : null,
    range?.[1] ? new Date(range[1]) : null,
  ];
};

const defaultRange: DateRangeValue = [
  new Date('2024-04-01T00:00:00.000Z'),
  new Date('2024-04-08T00:00:00.000Z'),
];

const RangeStory = (args: Story['args']) => {
  const [value, setValue] = useState<DateRangeValue>(() =>
    normalizeRangeValue(args?.value ?? defaultRange)
  );
  const [startTime, updateStartTime] = useState(args?.startTime ?? '09:00');
  const [endTime, updateEndTime] = useState(args?.endTime ?? '18:00');

  return (
    <DatePicker
      {...args}
      value={value}
      startTime={startTime}
      endTime={endTime}
      onChange={(nextRange) => {
        setValue(nextRange);
        args?.onChange?.(nextRange);
      }}
      setStartTime={(time) => {
        updateStartTime(time);
        args?.setStartTime?.(time);
      }}
      setEndTime={(time) => {
        updateEndTime(time);
        args?.setEndTime?.(time);
      }}
    />
  );
};

export const WithTimeSelection: Story = {
  args: {
    value: defaultRange,
    isTimeEnabled: true,
    startTime: '09:00',
    endTime: '18:00',
    onChange: fn(),
    setStartTime: fn(),
    setEndTime: fn(),
  },
  render: (args) => <RangeStory {...args} />,
};
