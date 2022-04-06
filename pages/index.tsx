import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { queryRPTStatus, queryRewardPoolClock } from '../api/vesting';
import { getRewardPools } from '../api/backend';
import { useBreakpoint } from '../hooks/breakpoints';
import { CHECK_KEPLR_REQUESTED, KEPLR_SIGN_OUT } from '../redux/actions/user';
import { defaultColors } from '../styles/theme';
import notify from '../utils/notifications';
import NavBarLogo from '../components/NavBarLogo';
import ConnectWalletButton from '../components/ConnectWalletButton';
import ConnectWalletView from '../components/ConnectWalletView';
// import ClaimButton from '../components/ClaimButton';
import { FaGithub } from 'react-icons/fa';
import { IStore } from '../redux/store';
//import { getFeeForExecute } from '../api/utils';
import { RPTStatus } from '../api/vesting';
interface Props {
  onClickConnectWallet: (e: React.SyntheticEvent) => void;
}

const Claim: React.FC<Props> = ({}) => {
  const [showConnectWalletView, setShowConnectWalletView] = useState(false);
  const [showSwapAccountDrawer, setShowSwapAccountDrawer] = useState(false);
  // const [nextButtonLoading, setNextButtonLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState('');

  // const [canVest, setCanVest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rptStatus, setRptStatus] = useState<RPTStatus>(undefined);
  const [rewardPoolsClock, setrewardPoolsClock] = useState([]);

  const user = useSelector((state: IStore) => state.user);
  const breakpoint = useBreakpoint();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: CHECK_KEPLR_REQUESTED });
  }, [dispatch]);

  useEffect(() => {
    if (user.secretjs && user.isKeplrInstalled) {
      setShowConnectWalletView(false);
    }

    if (user.secretjs && !rptStatus) {
      getRPTStatus();
    }
  }, [user.secretjs, user.isKeplrInstalled]);

  useEffect(() => {
    if (user && user.isKeplrAuthorized && showConnectWalletView) {
      setShowConnectWalletView(false);
      setShowSwapAccountDrawer(false);
    }
  }, [user, showConnectWalletView]);

  const getRPTStatus = async () => {
    try {
      setIsLoading(true);

      const unixTime = Math.floor(Date.now() / 1000);

      const status = await queryRPTStatus(user.secretjs, unixTime);

      const v3RewardPools = await getRewardPools();
      const rewardPools = await queryRewardPoolClock(v3RewardPools, user.secretjsSend, unixTime);

      setrewardPoolsClock(rewardPools);

      // setCanVest(status.progress.claimed !== status.progress.unlocked);
      setIsLoading(false);
      setRptStatus(status);

      console.warn('RPT status: ', status);
    } catch (error) {
      // setCanVest(false);
      setIsLoading(false);

      notify.error(`Failed getting RPT status`, 10, 'Error', JSON.stringify(error.message));
      console.warn('Error getting RPT status: ', error);
    }
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

  /*const onClickVestNow = async () => {
    setNextButtonLoading(true);

    try {
  
      const result = await triggerVest();

      console.log('result: ', result);

      dispatch({ type: CHECK_KEPLR_REQUESTED });

      setNextButtonLoading(false);

      notify.success(
        'Transaction successful',
        0,
        '',
        'Please verify the transaction does not include any errors by clicking View Transaction above.',
        'View transaction',
        `${process.env.SCRT_EXPLORER_URL}/transactions/${result.transactionHash}`
      );

      // notify.success(`Successfully called vest on RPT`, 4.5, 'Title here', 'Animation text');
    } catch (error) {
      console.warn('Error', error);

      notify.error(`Error calling vest on RPT`, 0, 'Error', JSON.stringify(error.message));

      setNextButtonLoading(false);
    }
  };*/

  /*const connectKeplr = async () => {
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
  };*/

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

  const renderStatus = () => {
    if (!rptStatus) {
      return 'Loading';
    }

    if (rptStatus.progress.claimed === rptStatus.progress.unlocked) {
      return 'Nothing to vest ✅';
    }

    return 'RPT needs vesting';
  };

  const renderRewardPools = () => {
    const indents = [];
    if (!rewardPoolsClock || !rewardPoolsClock.length) {
      return (
        <RowDiv>
          <StatusText textAlign="left">Loading...</StatusText>
        </RowDiv>
      );
    }

    for (let i = 0; i < rewardPoolsClock.length; i++) {
      indents.push(
        <RowDiv>
          <StatusText textAlign="left">
            {rewardPoolsClock[i].address.substring(0, 30)}...
          </StatusText>
          <StatusText textAlign="right">{rewardPoolsClock[i].clock}</StatusText>
        </RowDiv>
      );
    }
    return indents;
  };

  // const renderButtonText = () => {
  //   if (!rptStatus) {
  //     return 'Loading';
  //   }

  //   if (rptStatus.progress.claimed === rptStatus.progress.unlocked) {
  //     return 'Nothing to vest';
  //   }

  //   return 'Vest RPT';
  // };

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
              {user.isKeplrAuthorized && (
                <DisconnectWalletButton onClick={disconnectWallet}>
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

            {/* {user.isKeplrAuthorized ? (
              <ClaimButton
                text={nextButtonLoading ? 'Working...' : renderButtonText()}
                icon={!nextButtonLoading && '/icons/arrow-forward-light.svg'}
                fontSize={nextButtonLoading ? '12px' : '14px'}
                width="16.64"
                height="16"
                onClick={onClickVestNow}
                disabled={isLoading || !canVest}
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
                disabled={isLoading || !canVest}
                containerStyle={{
                  backgroundColor: defaultColors.swapBlue,
                }}
              />
            )} */}

            <p style={{ marginTop: 24 }}>Check the status of RPT here.</p>
            <p>RPT is the contract that vests tokens to rewards.</p>

            <p>
              You can learn more about RPT on{' '}
              <GithubA
                href="https://github.com/SiennaNetwork/SiennaNetwork#architecture-overview"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/SiennaNetwork/SiennaNetwork
              </GithubA>
            </p>

            {/* <ErrorText>{errorMessage}</ErrorText> */}
          </ClaimBodyLeft>

          <DummyRightSide
            xs="12"
            sm="12"
            md="12"
            lg="6"
            xl="6"
            $isKeplr={user.isKeplrAuthorized}
          ></DummyRightSide>

          <ClaimBodyRight $isKeplr={user.isKeplrAuthorized}>
            <h3>Reward Pools v3 Status</h3>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Address
              </StatusText>
              <StatusText textAlign="right" bold>
                Clock
              </StatusText>
            </RowDiv>

            {renderRewardPools()}

            <br />
            <br />
            <h3>RPT Status</h3>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Status
              </StatusText>
              <StatusText textAlign="right">{renderStatus()}</StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Claimed
              </StatusText>
              <StatusText textAlign="right">
                {rptStatus ? rptStatus.progress.claimed : 'Loading'}
              </StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Unlocked
              </StatusText>
              <StatusText textAlign="right">
                {rptStatus ? rptStatus.progress.unlocked : 'Loading'}
              </StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Elapsed
              </StatusText>
              <StatusText textAlign="right">
                {rptStatus ? rptStatus.progress.elapsed : 'Loading'}
              </StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Launched
              </StatusText>
              <StatusText textAlign="right">
                {rptStatus ? rptStatus.progress.launched : 'Loading'}
              </StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Time
              </StatusText>
              <StatusText textAlign="right">
                {rptStatus ? rptStatus.progress.time : 'Loading'}
              </StatusText>
            </RowDiv>

            <div style={{ width: '319px', marginBottom: '88px' }}>
              <ViewSienna
                disabled={isLoading}
                isSwapComplete={false}
                onClick={() => {
                  getRPTStatus();
                }}
              >
                {isLoading ? 'Checking...' : 'Check Status'}
              </ViewSienna>
            </div>
          </ClaimBodyRight>
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

const GithubA = styled.a`
  color: black;
  &:hover {
    opacity: 0.5;
  }
`;

const StatusText = styled.div<{ textAlign: string; bold?: boolean }>`
  font-size: 13px;
  text-align: ${(props) => props.textAlign};
  font-weight: ${(props) => (props.bold ? 'bold' : 'normal')};
`;

const RowDiv = styled.div`
  display: flex;
  justify-content: space-between;
  width: 310px;
`;

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

const ViewSienna = styled.button<{ isSwapComplete?: boolean }>`
  width: 184px;
  height: 40px;
  border: 1px solid ${defaultColors.white};
  background: ${(props) => (props.isSwapComplete ? defaultColors.swapBlue : defaultColors.primary)};
  color: ${(props) => (props.isSwapComplete ? '#fff' : '#fff')};
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 24px;
`;

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

const ClaimBodyRight = styled.div<{ $isKeplr?: boolean }>`
  position: absolute;
  width: ${(props) => (props.$isKeplr ? '50%' : '0%')};
  height: 90vh;
  top: 10vh;
  right: 0;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 2s;
  z-index: 10;

  > h2 {
    font-size: 60px;

    font-weight: 800;
    line-height: initial;
    width: 319px;
    color: ${defaultColors.blackStone80};
    margin-bottom: 12px;
  }
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
