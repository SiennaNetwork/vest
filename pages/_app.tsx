import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'antd/dist/antd.css';

import App from 'next/app';
import { END } from 'redux-saga';
import { Provider, useStore } from 'react-redux';
import { wrapper } from '../redux/store';
import { BreakpointProvider } from '../hooks/breakpoints';
import { queries } from '../styles/breakpoints';
import { AppProps } from 'next/app';
import StyleProvider from '../components/StyleProvider';
import Head from '../components/Head';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const store = useStore();

  return (
    <Provider store={store}>
      <StyleProvider>
        <Head />
        <BreakpointProvider queries={queries}>
          <Component {...pageProps} />
        </BreakpointProvider>
      </StyleProvider>
    </Provider>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = {
    ...(App.getInitialProps ? await App.getInitialProps(appContext) : {}),
  };

  if (appContext.req) {
    appContext.store.dispatch(END);
    await appContext.store.sagaTask.toPromise();
  }
  return { ...appProps };
};

export default wrapper.withRedux(MyApp);
