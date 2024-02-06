import { render } from '@testing-library/react';

import { UploadFileIcon } from './upload-file-icon';

describe('UploadFileIcon', () => {
  it('should render the upload file icon', () => {
    const { container } = render(<UploadFileIcon />);
    expect(container.getElementsByTagName('path')).toBeTruthy();
  });
});
