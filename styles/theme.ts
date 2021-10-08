import { breakpoints } from './breakpoints';

export const defaultColors = {
  primary: '#28282E',
  swapBlue: '#2070CC',
  lendBlue: '#375D8D',
  stableBlue: '#212C3A',
  disabledBlue: '#d2e2f5',
  white: '#F9F9F9',
  dark: '#28282E',
  green: '#20CC7A',
  orange: '#FDA003',
  red: '#CC203F',
  ash: '#413e65',
  blackStone20: '#F9F9F9',
  blackStone25: '#F5F5F5',
  blackStone30: '#EAEAEA',
  blackStone40: '#BFBFC0',
  blackStone50: '#949497',
  blackStone60: '#69696D',
  blackStone70: '#3E3E43',
  blackStone80: '#28282E',
  blackStone90: '#202024',
};

const colors = {
  primary: defaultColors.primary,
  swapBlue: defaultColors.swapBlue,
  disabledBlue: defaultColors.disabledBlue,
  light: defaultColors.white,
  bg: defaultColors.white,
  bgInverted: defaultColors.blackStone80,
  text: defaultColors.primary,
  textInverted: defaultColors.white,
  warning: defaultColors.orange,
  danger: defaultColors.red,
  success: defaultColors.green,
  dividerLine: defaultColors.blackStone30,
  dividerLineInverted: defaultColors.blackStone70,
};

const theme = {
  colors,
  breakpoints: {
    xs: `${breakpoints.xs}px`,
    sm: `${breakpoints.sm}px`,
    md: `${breakpoints.md}px`,
    lg: `${breakpoints.lg}px`,
    xl: `${breakpoints.xl}px`,
  },
};

export type ThemeType = typeof theme;
export default theme;
