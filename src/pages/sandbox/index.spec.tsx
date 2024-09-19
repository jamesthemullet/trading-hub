import { render } from '@testing-library/react';
import Index, { getServerSideProps } from './index.page';
import { screen } from '@testing-library/react';

describe('Index', () => {
  it('should render', () => {
    render(<Index nodeVersion="20.9.0" />);
    screen.getByText('Sandbox examples');
  });

  it('should return props', async () => {
    Object.defineProperty(process, 'version', {
      value: 'v20.9.0',
    });

    const props = await getServerSideProps();
    expect(props).toEqual({
      props: {
        nodeVersion: 'v20.9.0',
      },
    });
  });
});
