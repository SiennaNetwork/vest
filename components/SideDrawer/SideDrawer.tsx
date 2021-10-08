import { Drawer } from 'antd';
import styled from 'styled-components';
import { defaultColors } from '../../styles/theme';

const CloseIcon = styled.img`
  outline: none;
  border: none;
  cursor: pointer;
  pointer-events: initial;
`;

interface Props {
  onClose: () => void;
  visible: boolean;
  placement?: string;
}
const SideDrawer: React.FC<Props> = ({ onClose, visible, children }) => {
  return (
    <Drawer
      placement="right"
      closable
      onClose={onClose}
      visible={visible}
      getContainer={false}
      mask
      maskClosable
      maskStyle={{ background: 'transparent', position: 'fixed' }}
      width="280px"
      destroyOnClose={false}
      bodyStyle={bodyStyle}
      headerStyle={headerStyle}
      closeIcon={<CloseIcon src="/icons/close-icon.svg" />}
    >
      {children}
    </Drawer>
  );
};
export default SideDrawer;

const bodyStyle: React.CSSProperties = {
  background: defaultColors.primary,
  paddingTop: 20,
  justifyContent: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  background: 'white',
  border: 'none',
};
