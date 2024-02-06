import type { ChangeEvent } from 'react';

type FilterTypes = {
  value?: string;
  onChange: (event: string) => void;
};

type FilteredListItem = {
  identifier: string;
  editor: {
    name: string;
  };
};

export type FilteredListProps = Array<FilteredListItem>;

export const Filter = ({ value, onChange }: FilterTypes) => {
  return (
    <input
      type="text"
      aria-label="filter"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
    />
  );
};

export const FilteredList = ({ list }: { list: FilteredListProps }) => {
  return (
    <ul>
      {list.map((item: FilteredListItem) => (
        <li key={item.identifier}>{item.identifier}</li>
      ))}
    </ul>
  );
};
