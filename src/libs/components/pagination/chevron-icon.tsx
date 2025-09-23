import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<SVGSVGElement>,
  SVGSVGElement
> & {
  type: 'prev' | 'next';
};

const StyledAnimatedSvg = styled.svg`
  user-select: none;
`;

const StyledRect = styled.rect`
  fill: ${color.backgroundDarkGrey};
`;

export const ChevronIcon = ({ type, ...props }: Props) => {
  return (
    <StyledAnimatedSvg
      width="32"
      height="33"
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <StyledRect width="32" height="32" rx="16" />
      <path
        d={type === 'prev' ? 'M19 23L12 16.5L19 10' : 'M13 10L20 16.5L13 23'}
        stroke="#1D1D1B"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </StyledAnimatedSvg>
  );
};
