import styles from './typography.module.css';

type TypographyBaseProps = {
  id?: string;
  isStrong?: boolean;
  uppercase?: boolean;
  withMargin?: boolean;
  variant?:
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall';
  align?: 'left' | 'right' | 'center';
  className?: string;
  role?: string;
  children: React.ReactNode;
};

type LabelTypographyProps = TypographyBaseProps & {
  as: 'label';
  htmlFor?: string;
};

type StandardTypographyProps = TypographyBaseProps & {
  as?:
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'output' | 'time';
  htmlFor?: never;
};

type TypographyProps = LabelTypographyProps | StandardTypographyProps;

export const Typography = ({
  align = 'left',
  as: Component = 'p',
  variant = 'bodyMedium',
  children,
  isStrong = false,
  uppercase = false,
  withMargin = false,
  className,
  ...rest
}: TypographyProps) => (
  <Component
    className={
      className ? `${styles.typography} ${className}` : styles.typography
    }
    data-variant={variant}
    data-strong={isStrong}
    data-uppercase={uppercase}
    data-with-margin={withMargin}
    data-align={align}
    {...rest}
  >
    {children}
  </Component>
);
