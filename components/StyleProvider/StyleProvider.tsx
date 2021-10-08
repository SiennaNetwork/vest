import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';
import { GlobalStyles } from '../../styles/global';

const StyleProvider: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default StyleProvider;
