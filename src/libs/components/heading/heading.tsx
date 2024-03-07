import styled from '@emotion/styled';
import { colourDictionary } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Text } from '../typography/typography.styles';

const BreadcrumbText = styled(Text)`
  color: ${colourDictionary.black};
`;

const HeadingWrapper = styled.div`
  background: ${colourDictionary.white};
  box-shadow: #000 0 0 4px;
  padding: 23px;
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 3;
`;

const HeadingSpacer = styled.div`
  height: ${spacing(9)};
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
