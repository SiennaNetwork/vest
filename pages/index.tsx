import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { queryRPTStatus, queryRewardPoolClock } from '../api/vesting';
import { getRewardPools, callVestOnRPT } from '../api/backend';
import { useBreakpoint } from '../hooks/breakpoints';
import { CHECK_KEPLR_REQUESTED, KEPLR_SIGN_OUT } from '../redux/actions/user';
import { defaultColors } from '../styles/theme';
import NavBarLogo from '../components/NavBarLogo';
import ConnectWalletButton from '../components/ConnectWalletButton';
import ConnectWalletView from '../components/ConnectWalletView';
import { FaGithub } from 'react-icons/fa';
import { IStore } from '../redux/store';
import notify from '../utils/notifications';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface Props {
  onClickConnectWallet: (e: React.SyntheticEvent) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const Claim: React.FC<Props> = ({}) => {
  const [showConnectWalletView, setShowConnectWalletView] = useState(false);
  const [showSwapAccountDrawer, setShowSwapAccountDrawer] = useState(false);
  const [RPTData, setRPTData] = useState(undefined);
  const [RPTStatusData, setRPTStatusData] = useState(undefined);
  const [tabIndex, setTabIndex] = useState(0);
  const [isVesting, setIsVesting] = useState(false);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
  }, [user.secretjs, user.isKeplrInstalled]);

  useEffect(() => {
    if (user && user.isKeplrAuthorized && showConnectWalletView) {
      setShowConnectWalletView(false);
      setShowSwapAccountDrawer(false);
    }

    if (user.secretjs && !RPTData) {
      getRPTData();
    }
  }, [user, showConnectWalletView]);

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  const getRPTData = async () => {
    const v3RewardPools = await getRewardPools();
    const data = v3RewardPools
      .map((p) => p.rpt_address)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((rpt_address) => {
        const rewards = v3RewardPools.filter((pool) => pool.rpt_address === rpt_address);
        return {
          rpt_address: rewards[0].rpt_address,
          mgmt_address: rewards[0].mgmt_address,
          rewards: rewards.map((reward) => ({
            address: reward.rewards_contract,
            created: reward.created,
            name: reward.inc_token.name,
          })),
          token: rewards[0].rewards_token.symbol,
        };
      });
    setRPTData(data);

    const rptStatus = await Promise.all(
      data.map(async (entry) => {
        const status = {
          success: false,
          result: undefined,
        };
        try {
          const rptResult = await queryRPTStatus(
            user.secretjs,
            entry.rpt_address,
            entry.mgmt_address
          );
          status.success = true;
          status.result = rptResult.progress ? rptResult.progress : rptResult;
        } catch (e) {
          status.result = e.toString();
        }
        return {
          pools: await queryRewardPoolClock(entry.rewards, user.secretjs),
          status: status,
          rpt_address: entry.rpt_address,
          partner: entry.rpt_address !== process.env.RPT_CONTRACT,
        };
      })
    );

    setRPTStatusData(rptStatus);
  };

  const callVest = async (address, partner) => {
    setIsVesting(true);
    notify.success('Please wait, it may take up to a couple minutes', 3, 'Calling Vest');
    try {
      const result = await callVestOnRPT(address, partner);
      if (result.success) notify.success('Vested RPT');
      else notify.error(`Failed vesting RPT`, 10, 'Error', result.error);
    } catch (e) {
      notify.error(`Failed vesting RPT`, 10, 'Error', e.toString());
    }
    setIsVesting(false);
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

  const goToGithub = () => {
    const a = document.createElement('a');
    a.href = 'https://github.com/SiennaNetwork/vest';
    a.target = '_blank';
    a.rel = 'noopener norefferer';
    a.click();
  };

  const checkWindowSize = () => {
    let isMobile: boolean;
    if (breakpoint.md || breakpoint.sm || breakpoint.lg) isMobile = false;
    else isMobile = true;
    return isMobile;
  };

  const renderRPTData = () => {
    if (!RPTData) return 'Loading...';
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleChange} aria-label="">
            {RPTData.map((RPT, index) => (
              <Tab
                key={index}
                label={RPT.token}
                {...{
                  id: `simple-tab-${index}`,
                  'aria-controls': `simple-tabpanel-${index}`,
                }}
              />
            ))}
          </Tabs>
        </Box>
        {RPTData.map((RPT, index) => (
          <TabPanel key={index} value={tabIndex} index={index}>
            {renderRPTResponse(RPT.rpt_address)}
          </TabPanel>
        ))}
      </Box>
    );
  };

  const renderRPTResponse = (rpt_address) => {
    if (!RPTStatusData) return 'Loading...';
    const data = RPTStatusData.find((entry) => entry.rpt_address === rpt_address);
    return (
      <div>
        <h3>Reward Pools Status</h3>
        <RowDiv>
          <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
            Name
          </StatusText>
          <StatusText textAlign="right" bold>
            Clock
          </StatusText>
        </RowDiv>
        <Container>
          {data.pools.map((pool, index) => (
            <RowDiv key={index}>
              <StatusText textAlign="left">{pool.name}</StatusText>
              <StatusText textAlign="right">
                {pool.clock} | {pool.clock_should_be}
              </StatusText>
            </RowDiv>
          ))}
        </Container>
        <br />
        <br />
        <h3>RPT Status</h3>

        {!data.status.success && (
          <div>
            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                {data.status.result}
              </StatusText>
            </RowDiv>
          </div>
        )}

        {data.status.success && (
          <div>
            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Status
              </StatusText>
              <StatusText textAlign="right">
                {data.status.result.claimed === data.status.result.unlocked && (
                  <span>Nothing to vest ✅</span>
                )}
                {data.status.result.claimed !== data.status.result.unlocked && (
                  <span>RPT needs vesting</span>
                )}
              </StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Claimed
              </StatusText>
              <StatusText textAlign="right">{data.status.result.claimed}</StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Unlocked
              </StatusText>
              <StatusText textAlign="right">{data.status.result.unlocked}</StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Elapsed
              </StatusText>
              <StatusText textAlign="right">{data.status.result.elapsed}</StatusText>
            </RowDiv>

            <RowDiv>
              <StatusText textAlign="left" bold style={{ marginRight: 20 }}>
                Launched
              </StatusText>
              <StatusText textAlign="right">{data.status.result.launched}</StatusText>
            </RowDiv>
          </div>
        )}
        <br />
        {data.status.result.claimed !== data.status.result.unlocked && (
          <ViewSienna
            disabled={isVesting}
            isSwapComplete={false}
            onClick={() => {
              callVest(data.rpt_address, data.partner);
            }}
          >
            {isVesting ? 'Vesting...' : 'Vest RPT'}
          </ViewSienna>
        )}

        <div style={{ width: '319px', marginBottom: '88px' }}></div>
      </div>
    );
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

          <ClaimBodyRight $isKeplr={user.isKeplrAuthorized}>{renderRPTData()}</ClaimBodyRight>
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

const Container = styled.div`
  display: block;
  justify-content: space-between;
  max-height: 300px;
  display: block;
  overflow-y: scroll;
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
  top: 20%;
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
