import { render } from '@testing-library/react';
import Index, { getServerSideProps } from './index.page';
import { screen } from '@testing-library/react';

describe('Index', () => {
  it('should render', () => {
    render(<Index />);
    screen.getByText('Sandbox');
  });

  it('should return props', async () => {
    const props = await getServerSideProps();
    expect(props).toEqual({ props: {} });
  });
});
