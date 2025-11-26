import styles from './typography.module.css';

type TypographyProps = {
  isStrong?: boolean;
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
  as?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'label'
    | 'output';
  align?: 'left' | 'right' | 'center';
  className?: string;
  role?: string;
  children: React.ReactNode;
};

export const Typography = ({
  align = 'left',
  as: Component = 'p',
  variant = 'bodyMedium',
  children,
  isStrong = false,
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
    data-with-margin={withMargin}
    data-align={align}
    {...rest}
  >
    {children}
  </Component>
);
