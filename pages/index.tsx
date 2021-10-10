import styled, { css } from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { callVestOnRPT } from '../api/vesting';
import { unlockToken } from '../constants';
import { useBreakpoint } from '../hooks/breakpoints';
import {
  CHECK_KEPLR_REQUESTED,
  SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED,
  KEPLR_SIGN_OUT,
} from '../redux/actions/user';
import { defaultColors } from '../styles/theme';
import notify from '../utils/notifications';
import NavBarLogo from '../components/NavBarLogo';
import ConnectWalletButton from '../components/ConnectWalletButton';
import ConnectWalletView from '../components/ConnectWalletView';
import ClaimButton from '../components/ClaimButton';
import { FaGithub } from 'react-icons/fa';
import { IStore } from '../redux/store';
import { getFeeForExecute } from '../api/utils';

interface Props {
  onClickConnectWallet: (e: React.SyntheticEvent) => void;
}

const Claim: React.FC<Props> = ({}) => {
  const [showConnectWalletView, setShowConnectWalletView] = useState(false);
  const [showSwapAccountDrawer, setShowSwapAccountDrawer] = useState(false);
  const [nextButtonLoading, setNextButtonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const user = useSelector((state: IStore) => state.user);
  const breakpoint = useBreakpoint();
  const dispatch = useDispatch();

  const isUnlock = user.balanceSIENNA === unlockToken;

  const renderBalanceSIENNA = () => {
    if (isUnlock) {
      return 'View Balance';
    }

    return `${user.balanceSIENNA} SIENNA` || '0 SIENNA';
  };

  useEffect(() => {
    dispatch({ type: CHECK_KEPLR_REQUESTED });
  }, [dispatch]);

  useEffect(() => {
    if (user.secretjs && user.isKeplrInstalled) {
      setShowConnectWalletView(false);
    }
  }, [user.secretjs, user.isKeplrInstalled]);

  useEffect(() => {
    if (user && user.isKeplrAuthorized && showConnectWalletView) {
      setShowConnectWalletView(false);
      setShowSwapAccountDrawer(false);
    }
  }, [user, showConnectWalletView]);

  const onClickUnlockToken = (e: React.SyntheticEvent) => {
    e.stopPropagation();

    dispatch({
      type: SHOW_HIDDEN_TOKEN_BALANCE_REQUESTED,
      payload: {
        tokenAddress: process.env.SIENNA_CONTRACT,
        symbol: undefined,
      },
    });
  };

  // user clicks on connect/disconnect wallet button
  const onClickToggleWallet = () => {
    if (user && user.isKeplrAuthorized) {
      dispatch({ type: KEPLR_SIGN_OUT });
    } else {
      setShowConnectWalletView(true);
      dispatch({ type: CHECK_KEPLR_REQUESTED });
      setShowSwapAccountDrawer(true);
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: KEPLR_SIGN_OUT });
  };

  const onClickVestNow = async () => {
    setNextButtonLoading(true);

    try {
      await callVestOnRPT(user.secretjsSend, process.env.RPT_CONTRACT, getFeeForExecute(500_000));

      dispatch({ type: CHECK_KEPLR_REQUESTED });

      setNextButtonLoading(false);

      notify.success(`Successfully called vest on RPT`, 4.5);
    } catch (error) {
      console.warn('Error', error);

      notify.error(`Error calling vest on RPT`, 10, 'Error', JSON.stringify(error.message));

      setNextButtonLoading(false);
    }
  };

  const connectKeplr = async () => {
    if (!user.isKeplrInstalled) {
      setErrorMessage('You need to install Keplr Wallet');

      const a = document.createElement('a');
      a.href = 'https://wallet.keplr.app/';
      a.target = '_blank';
      a.rel = 'noopener norefferer';
      a.click();
      return;
    }

    dispatch({ type: CHECK_KEPLR_REQUESTED });
  };

  const goToGithub = () => {
    const a = document.createElement('a');
    a.href = 'https://github.com/SiennaNetwork/vest';
    a.target = '_blank';
    a.rel = 'noopener norefferer';
    a.click();
    return;
  };

  const checkWindowSize = () => {
    let isMobile: boolean;
    if (breakpoint.md || breakpoint.sm || breakpoint.lg) isMobile = false;
    else isMobile = true;
    return isMobile;
  };

  return (
    <ClaimContainer>
      {checkWindowSize() && (
        <ClaimTopNavBar>
          <ClaimTopNavBarLeft xs="12" sm="12" md="12" lg="6" xl="6">
            <NavBarLogo />
          </ClaimTopNavBarLeft>

          <DummyClaimTopNavBarRight
            xs="12"
            sm="12"
            md="12"
            lg="6"
            xl="6"
            $isKeplr={user.isKeplrAuthorized}
          ></DummyClaimTopNavBarRight>

          {user.isKeplrAuthorized ? (
            <ClaimTopNavBarRight $isAuthorized={user.isKeplrAuthorized}>
              <span>Balance:</span>
              <UnlockTokenButton onClick={onClickUnlockToken} isUnlock={isUnlock}>
                {renderBalanceSIENNA()}
              </UnlockTokenButton>

              {user.isKeplrAuthorized && (
                <DisconnectWalletButton onClick={disconnectWallet} isUnlock={isUnlock}>
                  Disconnect Wallet
                </DisconnectWalletButton>
              )}

              {!user.isKeplrAuthorized && <ConnectWalletButton onClick={onClickToggleWallet} />}
              <ConnectWalletView
                visible={showSwapAccountDrawer}
                onClose={() => setShowSwapAccountDrawer(false)}
              />
            </ClaimTopNavBarRight>
          ) : (
            <ClaimTopNavBarRight>&nbsp;</ClaimTopNavBarRight>
          )}
        </ClaimTopNavBar>
      )}

      {checkWindowSize() && (
        <ClaimBody>
          <ClaimBodyLeft xs="12" sm="12" md="12" lg="6" xl="6" $isKeplr={user.isKeplrAuthorized}>
            <h1>Vest RPT</h1>

            {false && <h5>Before you can continue you need SCRT in your wallet.</h5>}

            {user.isKeplrAuthorized ? (
              <ClaimButton
                text={nextButtonLoading ? 'Working...' : 'Vest RPT'}
                icon={!nextButtonLoading && '/icons/arrow-forward-light.svg'}
                fontSize={nextButtonLoading ? '12px' : '14px'}
                width="16.64"
                height="16"
                onClick={onClickVestNow}
                disabled={false}
                prefixIcon={nextButtonLoading}
              />
            ) : (
              <ClaimButton
                text="Connect your Keplr Wallet"
                icon="/icons/wallet-light.svg"
                fontSize="14px"
                width="16.64"
                height="16"
                onClick={connectKeplr}
                disabled={false}
                containerStyle={{
                  backgroundColor: defaultColors.swapBlue,
                }}
              />
            )}

            <p style={{ marginTop: '24px' }}>
              Manually call vest on RPT if needed. Any account can do this.
            </p>
            <ErrorText>{errorMessage}</ErrorText>
          </ClaimBodyLeft>

          <DummyRightSide
            xs="12"
            sm="12"
            md="12"
            lg="6"
            xl="6"
            $isKeplr={user.isKeplrAuthorized}
          ></DummyRightSide>

          {/* {user.isKeplrAuthorized ? (
            <ClaimBodyRight $isKeplr={user.isKeplrAuthorized}>
              <h2></h2>

              <p>
                Remember, you can <strong>stake SIENNA</strong> or become a liquidity provider
                on SiennaSwap, where you can earn even more SIENNA.
              </p>

              <div style={{ width: '319px', marginBottom: '88px' }}>
                <ViewSienna isSwapComplete={false} onClick={() => goToEarn()}>
                  Earn SIENNA
                </ViewSienna>
              </div>
            </ClaimBodyRight>
          ) : (
            <ClaimBodyRight>&nbsp;</ClaimBodyRight>
          )} */}
        </ClaimBody>
      )}

      {!checkWindowSize() && (
        <ClaimBodyMobile>
          <ClaimBodyLeftMobile xs="12" sm="12" md="12" lg="6" xl="6">
            <h1>Vest RPT</h1>

            <p>You can only call vest on desktop using Brave or Chrome</p>

            <NavBarLogo />
          </ClaimBodyLeftMobile>
        </ClaimBodyMobile>
      )}

      <FaGithub
        onClick={goToGithub}
        style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          width: 35,
          height: 35,
          cursor: 'pointer',
        }}
      />
    </ClaimContainer>
  );
};

export default Claim;

const ClaimContainer = styled.div`
  padding: 0;
  margin: 0;
  background: #fff;
`;

const ClaimTopNavBar = styled(Row)`
  margin: 0;
  height: 10vh;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    height: auto;
    padding-bottom: 30px;
  }
`;

const ClaimTopNavBarLeft = styled(Col)`
  padding-left: 0;
  background: ${defaultColors.white};
`;

const DummyClaimTopNavBarRight = styled(Col)<{ $isKeplr: boolean }>`
  background: ${(props) => (props.$isKeplr ? '#fff' : defaultColors.blackStone20)};
`;

const ClaimTopNavBarRight = styled.div<{ $isAuthorized?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${(props) => (props.$isAuthorized ? '50%' : '0%')};
  overflow: hidden;

  justify-content: flex-end;
  display: flex;
  padding: 40px 40px 0 0;
  height: 10vh;

  transition: 2s;
  z-index: 10;

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: 40px 15px 0 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

// const ViewSienna = styled.button<{ isSwapComplete?: boolean }>`
//   width: 184px;
//   height: 40px;
//   border: 1px solid ${defaultColors.white};
//   background: ${(props) => (props.isSwapComplete ? defaultColors.swapBlue : defaultColors.primary)};
//   color: ${(props) => (props.isSwapComplete ? '#fff' : '#fff')};
//   font-size: 14px;
//   font-weight: 600;
//   border-radius: 20px;
//   cursor: pointer;
//   margin-top: 24px;
// `;

const ClaimBodyMobile = styled(Row)`
  margin: 0;
  height: 100vh;
  align-content: center;
  flex-wrap: nowrap;
`;

const ClaimBodyLeftMobile = styled(Col)<{ $darkMode?: boolean }>`
  padding: 0;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h1 {
    font-size: 50px;
    font-weight: 800;
    line-height: initial;
    color: ${(props) => (props.$darkMode ? '#fff' : defaultColors.blackStone80)};
    width: 295px;
    margin-bottom: 0;
  }

  > p {
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    width: 295px;
    margin-top: 16px;
    margin-bottom: 24px;
  }

  > div {
    position: relative;
    width: 295px;
    padding: 0;
    justify-content: flex-start;

    > img {
      width: 101px;
      height: 30px;
    }
  }

  }
`;

const ClaimBody = styled(Row)`
  margin: 0;
  height: 90vh;
  align-content: center;
  flex-wrap: nowrap;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    height: auto;
  }
`;

const ClaimBodyLeft = styled(Col)<{ $darkMode?: boolean; $isKeplr: boolean }>`
  padding: 0;
  height: 100%;
  background: ${defaultColors.white};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h1 {
    font-size: 60px;
    font-weight: 800;
    line-height: initial;
    color: ${(props) => (props.$darkMode ? '#fff' : defaultColors.blackStone80)};
    width: 319px;
  }

  > p {
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    width: 320px;
    margin-top: 10px;
  }

  > h5 {
    font-weight: 600;
    font-size: 12px;
    line-height: 14.52px;
    color: ${defaultColors.red};
    margin-bottom: 12px;
  }
}
`;

const DummyRightSide = styled(Col)<{ $isKeplr: boolean }>`
  background: ${(props) => (props.$isKeplr ? '#fff' : defaultColors.blackStone20)};
`;

// const ClaimBodyRight = styled.div<{ $isKeplr?: boolean }>`
//   position: absolute;
//   width: ${(props) => (props.$isKeplr ? '50%' : '0%')};
//   height: 90vh;
//   top: 10vh;
//   right: 0;
//   overflow: hidden;

//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   transition: 2s;
//   z-index: 10;

//   > h2 {
//     font-size: 60px;
//     font-weight: 800;
//     line-height: initial;
//     width: 319px;
//     color: ${defaultColors.blackStone80};
//     margin-bottom: 12px;
//   }

//   > p {
//     font-size: 14px;
//     font-weight: 400;
//     line-height: 24px;
//     width: 320px;
//     margin-top: 10px;
//   }

//   > div {
//     > p {
//       height: 20px;
//       font-style: italic;
//       margin-top: 19px;
//       font-size: 16px;
//     }
//   }
// `;

const UnlockButtonCSS = css`
  pointer-events: initial;
  border: 1px solid black;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 20px;
  background: ${(props) => props.theme.colors.text};
  color: ${(props) => props.theme.colors.textInverted};
  font-size: 11px;
  padding-top: 1px;
  padding-bottom: 1px;

  &:hover {
    opacity: 0.7;
  }
`;

const UnlockTokenButton = styled.div<{ isUnlock?: boolean }>`
  color: ${(props) => props.theme.colors.text};
  height: 24px;
  font-size: 12px;
  width: ${(props) => (!props.isUnlock ? 'auto' : '108px')};
  font-weight: 400;
  text-align: center;
  margin-bottom: 14px;
  margin-left: 5px;
  pointer-events: none;
  display: inline-block;
  cursor: pointer;
  line-height: ${(props) => (!props.isUnlock ? '24px' : '20px')};

  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;

  ${(props) => (props.isUnlock ? UnlockButtonCSS : null)};
`;

const DisconnectWalletButton = styled.div<{ isUnlock?: boolean }>`
  color: ${defaultColors.blackStone80};
  background: #fff;
  border: 1px solid ${defaultColors.blackStone30};
  width: 134px;
  border-radius: 12px;
  height: 24px;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  margin-bottom: 14px;
  margin-left: 24px;
  display: inline-block;
  cursor: pointer;
  line-height: 22px;
  cursor: pointer;

  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
`;

const ErrorText = styled.div`
  color: ${(props) => props.theme.colors.warning};
  text-align: center;
`;
