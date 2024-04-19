import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Text } from '../typography/typography.styles';

const BreadcrumbText = styled(Text)`
  color: #000;
`;

const HeadingWrapper = styled.div`
  background: #fff;
  box-shadow: #000 0 0 4px;
  padding: ${spacing(1)};
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 3;
`;

const HeadingSpacer = styled.div`
  height: ${spacing(5)};
`;

type Props = {
  breadcrumbs: string[];
};

export const Heading = ({ breadcrumbs }: Props) => {
  return (
    <>
      <HeadingSpacer />
      <HeadingWrapper>
        <Breadcrumb>
          {breadcrumbs.map((breadcrumb) => (
            <BreadcrumbText as={'span'} key={breadcrumb}>
              {breadcrumb}
            </BreadcrumbText>
          ))}
        </Breadcrumb>
      </HeadingWrapper>
    </>
  );
};
