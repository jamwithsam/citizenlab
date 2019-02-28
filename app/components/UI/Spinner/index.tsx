import React, { PureComponent } from 'react';
import styled, { keyframes } from 'styled-components';
import { media } from 'utils/styleUtils';

// Centered spinner taking the navbar height into account
const FullPageCenter = styled.div`
  width: 100%;
  min-height: calc(100vh - ${props => 2  * (props.theme.menuHeight)}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => 2 * props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const rotate = keyframes`
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
`;

interface IStyledSpinner {
  size: string;
  thickness: string;
  color: string;
}

const StyledSpinner: any = styled.div`
  width: ${(props: IStyledSpinner) => props.size};
  height: ${(props: IStyledSpinner) => props.size};
  animation: ${rotate} 800ms infinite linear;
  border-style: solid;
  border-right-color: transparent !important;
  border-width: ${(props: IStyledSpinner) => props.thickness};
  border-color: ${(props: IStyledSpinner) => props.color};
  border-radius: 50%;
  padding: 0;
  margin: 0;
`;

interface DefaultProps {
  size: string;
  thickness: string;
  color: string;
}

export interface ExtraProps {}

interface Props extends DefaultProps, ExtraProps {}

interface State {}

export default class Spinner extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    size: '32px',
    thickness: '3px',
    color: '#666'
  };

  render() {
    const className = this.props['className'];
    const { size, thickness, color } = this.props;

    return (
      <StyledSpinner className={className} size={size} thickness={thickness} color={color} />
    );
  }
}

export const FullPageCenteredSpinner = () => {
  return (
    <FullPageCenter>
      <Spinner />
    </FullPageCenter>
  );
};
