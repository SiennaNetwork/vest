import { useState, useEffect, createContext, useContext } from 'react';
interface IBreakpoint {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
}

const defaultValue: IBreakpoint = {};

const BreakpointContext = createContext(defaultValue);

interface Props {
  queries: Record<string, string>;
}

const BreakpointProvider: React.FC<Props> = ({ children, queries }) => {
  const [queryMatch, setQueryMatch] = useState({});

  useEffect(() => {
    const mediaQueryLists = {};
    const keys = Object.keys(queries);
    let isAttached = false;

    const handleQueryListener = () => {
      const updatedMatches = keys.reduce((acc, media) => {
        acc[media] = !!(mediaQueryLists[media] && mediaQueryLists[media].matches);
        return acc;
      }, {});
      setQueryMatch(updatedMatches);
    };

    if (window && window.matchMedia) {
      const matches = {};
      keys.forEach((media) => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media] = window.matchMedia(queries[media]);
          matches[media] = mediaQueryLists[media].matches;
        } else {
          matches[media] = false;
        }
      });
      setQueryMatch(matches);
      isAttached = true;
      keys.forEach((media) => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media].addListener(handleQueryListener);
        }
      });
    }

    return () => {
      if (isAttached) {
        keys.forEach((media) => {
          if (typeof queries[media] === 'string') {
            mediaQueryLists[media].removeListener(handleQueryListener);
          }
        });
      }
    };
  }, [queries]);

  return <BreakpointContext.Provider value={queryMatch}>{children}</BreakpointContext.Provider>;
};

function useBreakpoint(): IBreakpoint {
  const context = useContext(BreakpointContext);
  if (context === defaultValue) {
    throw new Error('useBreakpoint must be used within BreakpointProvider');
  }
  return context;
}

function useIsMobile() {
  const breakpoint = useBreakpoint();
  if (!breakpoint) return false;

  if (breakpoint.xs === true || breakpoint.sm === true || breakpoint.md === true) {
    return true;
  }
  return false;
}

export { useIsMobile, useBreakpoint, BreakpointProvider };
