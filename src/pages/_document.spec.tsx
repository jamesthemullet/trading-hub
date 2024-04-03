import Document from './_document.page';

/* eslint jest/expect-expect: "off" */
describe('<Document />', () => {
  it('should render without errors', async () => {
    Document();
  });
});
