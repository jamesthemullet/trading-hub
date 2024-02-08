import styled from '@emotion/styled';

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<SVGSVGElement>,
  SVGSVGElement
> & {
  type: 'prev' | 'next';
  isEnabled: boolean;
};

const StyledAnimatedSvg = styled.svg`
  cursor: pointer;
  user-select: none;
`;

export const ChevronIcon = ({ type, isEnabled, ...props }: Props) => {
  return (
    <StyledAnimatedSvg
      width="32"
      height="33"
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" rx="16" fill="#F1F1F1" />
      <path
        opacity={isEnabled ? '1.0' : '0.2'}
        d={type === 'prev' ? 'M19 23L12 16.5L19 10' : 'M13 10L20 16.5L13 23'}
        stroke="#1D1D1B"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </StyledAnimatedSvg>
  );
};
