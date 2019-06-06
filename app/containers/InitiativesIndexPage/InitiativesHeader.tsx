import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import FormattedAnchor from 'components/FormattedAnchor';
import messages from './messages';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { lighten } from 'polished';

const illustration = require('assets/img/initiativesHeaderImage.png');

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  min-height: 450px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.desktop`
    min-height: 450px;
  `}

  ${media.smallerThanMaxTablet`
    min-height: 350px;
  `}

  ${media.smallerThanMinTablet`
    min-height: 300px;
  `}
`;

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  padding-top: 50px;
  padding-bottom: 50px;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || (fontSizes.xxxl + 1)}px;
  line-height: normal;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;
const ColoredText = styled.span`
  color: ${({ theme }) => lighten(.3, theme.colorMain)};
`;

const Bold = styled.span`
  font-weight: 600;
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-top: 18px;
`;

const StartInitiative = styled(Button)`
  margin-top: 38px;

  ${media.smallerThanMinTablet`
    margin-top: 30px;
  `}
`;

const Manual = styled.div`
  width: 100%;
  min-height: 145px;
  height: auto;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.separation};
  border-left: none;
  border-right: none;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const ManualContent = styled.div`
  width: auto;
  max-width: 1150px;
  height: 100%;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin: 0;
  padding: 0 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Illustration = styled.img`
  height: 145px;
  margin-right: 70px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const ManualTitle = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 700;
  margin-bottom: 7px;
`;

const ManualText = styled.div`
  margin: 30px 0;
  color: ${colors.label};
  a {
    text-decoration: underline;
    color: inherit;
  }
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {}

class SignedOutHeader extends PureComponent<Props, State> {
  startInitiative = () => {
    trackEventByName(tracks.clickStartInitiativesCTA, { extra: { location: 'initiatives header' } });
    clHistory.push('/projects/an-idea-bring-it-to-your-council/ideas/new');
  }

  handleAvatarBubblesOnClick = () => {
    trackEventByName(tracks.clickAvatarBubbles, { extra: { location: 'initiatives header' } });
  }

  render() {
    const { className, theme, tenant } = this.props;

    if (isNilOrError(tenant)) return null;

    return (
      <Container className={`e2e-initiatives-header ${className}`}>
        <Header>
          <HeaderContent>
            <HeaderTitle>
              <FormattedMessage
                {...messages.header}
                values={{ styledOrgName: <ColoredText><FormattedMessage {...messages.orgName} /></ColoredText> }}
              />
            </HeaderTitle>

            <StyledAvatarBubbles onClick={this.handleAvatarBubblesOnClick} />

              <StartInitiative
                fontWeight="500"
                padding="13px 22px"
                bgColor={theme.colorMain}
                textColor="#FFF"
                icon="arrowLeft"
                iconPos="right"
                onClick={this.startInitiative}
                text={<FormattedMessage {...messages.startInitiative} />}
                className="e2e-initiatives-header-cta-button"
              />

          </HeaderContent>
        </Header>
        <Manual>
          <ManualContent>
            <Illustration src={illustration} alt="" />
            <ManualText>
              <ManualTitle>
                <FormattedMessage {...messages.explanationTitle} />
              </ManualTitle>
              <FormattedAnchor
                mainMessage={messages.explanationContent}
                mainMessageValues={{
                  constraints: (
                    <Bold>
                      <FormattedMessage
                        {...messages.constraints}
                        values={{
                          voteThreshold: get(tenant, 'attributes.settings.initiatives.voting_threshold'),
                          daysLimit: get(tenant, 'attributes.settings.initiatives.days_limit')
                        }}
                      />
                    </Bold>
                  )
                }}
                linkTextMessage={messages.readMore}
                urlMessage={messages.readMoreLink}
              />
            </ManualText>
          </ManualContent>
        </Manual>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

const SignedOutHeaderWithHoC = withTheme(SignedOutHeader);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignedOutHeaderWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
