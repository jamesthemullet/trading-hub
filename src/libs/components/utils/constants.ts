export const color = {
  buttonPrimaryHover: '#595959',
  primaryGreen: '#bdd755',
  lightGreen: '#dfece2',
  darkHeritageGreen: '#005640',
  lightGrey: '#ccc',
  grey: '#999',
  backgroundGrey: '#f5f5f5',
  backgroundPink: '#fbf6f4',
  successGreenBackground: '#f4faed',
  errorRedBackground: '#fff3f4',
  errorRed: '#ea122a',
  infoBlueBackground: '#eaf0f3',
  selectionBox: '#4273b7',
  successGreen: '#2db236',
  improvedFit: '#e86c25',
};

export const colourPalette = {
  primary: {
    white: '#ffffff',
    black: '#000000',
    green: '#bdd755',
    pattern:
      'linear-gradient(45deg, rgb(34, 193, 195), rgb(253, 187, 45), rgb(144, 19, 254))',
  },
  secondary: {
    lightGreen: '#dfece2',
    darkHeritageGreen: '#005640',
  },
  tertiary: {
    winterGreen: '#627786',
    winterGreen20: '#e0e4e7',
    darkGrey: '#222222',
    accessibilityGrey: '#707070',
    mediumGrey: '#949494',
    lightGrey: '#cccccc',
    backgroundGrey: '#f5f5f5',
    backgroundPink: '#fbf6f4',
  },
  functional: {
    successGreenBackground: '#f4faed',
    errorRedBackground: '#fff3f4',
    infoBlueBackground: '#eaf0f3',
    successGreen: '#2db236',
    errorRed: '#ea122a',
    infoBlue: '#1e5a7a',
    focusBlue: '#4273b7',
    reviewGreen: '#6fb06f',
  },
  offerAndSale: {
    foodBlack: '#000000',
    christmasGold: '#a98b52',
    saleRed: '#a6192e',
    offerYellow: '#f9c606',
    dineInYellow: '#efdf00',
    newAndImprovedFit: '#e86c25',
    charityPink: '#ff9999',
  },
  sparks: {
    sparksGreen: '#43d68a',
    sparksDarkGreen: '#003f35',
  },
  buttonHoverStyles: {
    primaryHover: '#b4cc51',
    secondaryHover: '#4e5f6b',
    tertiaryHover: '#e6e6e6',
  },
};

export const colourDictionary = {
  blue: {
    200: colourPalette.functional.infoBlueBackground,
    400: colourPalette.buttonHoverStyles.secondaryHover,
    500: colourPalette.functional.focusBlue,
    700: colourPalette.functional.infoBlue,
  },
  red: {
    200: colourPalette.functional.errorRedBackground,
    250: colourPalette.offerAndSale.charityPink,
    300: colourPalette.functional.errorRed,
    400: colourPalette.offerAndSale.saleRed,
  },
  orange: {
    100: colourPalette.tertiary.backgroundPink,
    500: colourPalette.offerAndSale.newAndImprovedFit,
  },
  yellow: {
    100: colourPalette.offerAndSale.offerYellow,
    200: colourPalette.offerAndSale.dineInYellow,
    400: colourPalette.offerAndSale.christmasGold,
  },
  green: {
    100: colourPalette.functional.successGreenBackground,
    200: colourPalette.tertiary.winterGreen20,
    300: colourPalette.secondary.lightGreen,
    400: colourPalette.primary.green,
    450: colourPalette.buttonHoverStyles.primaryHover,
    460: colourPalette.functional.reviewGreen,
    500: colourPalette.tertiary.winterGreen,
    600: colourPalette.sparks.sparksGreen,
    700: colourPalette.functional.successGreen,
    800: colourPalette.secondary.darkHeritageGreen,
    900: colourPalette.sparks.sparksDarkGreen,
  },
  grey: {
    100: colourPalette.tertiary.backgroundGrey,
    300: colourPalette.buttonHoverStyles.tertiaryHover,
    400: colourPalette.tertiary.lightGrey,
    600: colourPalette.tertiary.mediumGrey,
    700: colourPalette.tertiary.accessibilityGrey,
    950: colourPalette.tertiary.darkGrey,
  },
  black: colourPalette.primary.black,
  white: colourPalette.primary.white,
  pattern: colourPalette.primary.pattern,
};

export const colours = {
  primary: {
    main: colourPalette.primary.green,
    text: colourPalette.tertiary.darkGrey,
    disabled: colourPalette.tertiary.lightGrey,
    action: {
      hover: colourPalette.buttonHoverStyles.primaryHover,
    },
  },
  secondary: {
    main: 'transparent',
    text: colourPalette.tertiary.darkGrey,
    disabled: colourPalette.tertiary.lightGrey,
    action: {
      hover: colourPalette.buttonHoverStyles.tertiaryHover,
    },
  },
  tertiary: {
    main: 'transparent',
    text: colourPalette.tertiary.darkGrey,
    disabled: colourPalette.tertiary.lightGrey,
    action: {
      hover: colourPalette.buttonHoverStyles.tertiaryHover,
    },
  },
  sparks: {
    main: colourPalette.sparks.sparksGreen,
    text: colourPalette.tertiary.darkGrey,
    disabled: colourPalette.tertiary.lightGrey,
    action: {
      hover: colourPalette.functional.reviewGreen,
    },
  },
  divider: {
    main: colourPalette.tertiary.lightGrey,
    accessible: colourPalette.tertiary.accessibilityGrey,
    dark: colourPalette.tertiary.darkGrey,
  },
  text: {
    main: colourPalette.tertiary.darkGrey,
    disabled: colourPalette.tertiary.accessibilityGrey,
  },
  fade: {
    400: 'rgba(0, 0, 0, 0.4)',
    500: 'rgba(0, 0, 0, 0.6)',
  },
};

export const fonts = {
  primary: {
    regular: 'mnsLondonRegular, Helvetica, Arial, sans-serif',
    bold: 'mnsLondonBold, Helvetica, Arial, sans-serif',
    semiBold: 'mnsLondonSemiBold, Helvetica, Arial, sans-serif',
    italic: 'mnsLondonItalic, Helvetica, Arial, sans-serif',
    light: 'mnsLondonLight, Helvetica, Arial, sans-serif',
    boldCondensed: 'mnsLondonBoldCondensed, Helvetica, Arial, sans-serif',
  },
  size: {
    50: '0.625rem',
    100: '0.75rem',
    300: '0.875rem',
    400: '1rem',
    600: '1.25rem',
    800: '1.5rem',
    1000: '1.75rem',
    1100: '1.875rem',
    1150: '2.25rem',
    1200: '2.5rem',
    1350: '3.5rem',
    1400: '3.75rem',
    1600: '5rem',
  },
};

export const typography = {
  primary: {
    display: fonts.primary.semiBold,
    heading: fonts.primary.regular,
    bodyText: fonts.primary.regular,
    smallText: fonts.primary.semiBold,
    smallTextRegular: fonts.primary.regular,
  },
};
