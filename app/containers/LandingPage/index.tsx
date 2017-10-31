import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Footer from 'components/Footer';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { ideasStream, IIdeas } from 'services/ideas';
import { projectsStream, IProjects } from 'services/projects';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

// const header = require('./header.png');
const header = null;

const Container: any = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props: any) => props.hasHeader ? '#f8f8f8' : '#fff'};
  position: relative;
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 575px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-color: #f8f8f8;
`;

const Header: any = styled.div`
  width: 100%;
  height: 400px;
  margin: 0;
  padding: 0;
  z-index: 1;
  position: relative;
  background-image: url(${(props: any) => props.src ? props.src : ''});  
  background-repeat: no-repeat;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  ${media.smallerThanMinTablet`
    height: 300px;
  `}
`;

const HeaderOverlay = styled.div`
  background: #000;
  /* background: ${(props: any) => props.theme.colorMain}; */
  opacity: 0.6;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  z-index: 2;
`;

const HeaderLogoWrapper = styled.div`
  width: 110px;
  height: 110px;
  padding: 15px;
  margin-top: -20px;
  margin-bottom: 15px;
  border: solid 2px #eaeaea;
  border-radius: 6px;
  background: #fff;
  border: solid 2px #eaeaea;
`;

const HeaderLogo: any = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
`;

const HeaderTitle: any = styled.h1`
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 55px;
  line-height: 60px;
  font-weight: 600;
  text-align: left;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  margin: 0;
  padding: 0;
  padding-top: 130px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  ${media.smallerThanMinTablet`
    font-size: 38px;
    line-height: 44px;
    padding-top: 90px;
  `}
`;

const HeaderSubtitle: any = styled.h2`
  width: 100%;
  max-width: 560px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 22px;
  line-height: 26px;
  font-weight: 100;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  hyphens: auto;
  max-width: 980px;
  text-align: left;
  text-decoration: none;
  padding: 0;
  padding-bottom: 0px;
  margin: 0;
  margin-top: 20px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-bottom: solid 1px transparent;
  transition: all 150ms ease-out;

  ${media.phone`
    font-size: 20px;
    line-height: 26px;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const Section = styled.div`
  width: 100%;
  margin-top: 80px;
  padding-bottom: 60px;

  ${media.phone`
    &.ideas {
      margin-top: 0px;
    }
  `}
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 35px;

  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  display: flex;
  margin: 0;
  padding: 0;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

  ${media.phone`
    font-size: 23px;
    line-height: 36px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const ExploreText = styled.div`
  color: #84939E;
  font-size: 17px;
  font-weight: 300;
  line-height: 17px;
  margin-right: 8px;
  text-decoration: underline;
  transition: all 100ms ease-out;
`;

const ExploreIcon = styled(Icon) `;
  height: 19px;
  fill: #84939E;
  margin-top: 1px;
  transition: all 100ms ease-out;
`;

const Explore = styled(Link) `
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 3px;

  &:hover {
    ${ExploreText} {
      color: #000;
    }

    ${ExploreIcon} {
      fill: #000;
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

const SectionFooter = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ViewMoreButton = styled(Button) `
  margin-top: 20px;
`;

type Props = {};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  currentTenantHeader: string | null;
  hasIdeas: boolean;
  hasProjects: boolean;
};

class LandingPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  ideasQueryParameters: object;
  projectsQueryParameters: object;

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenant: null,
      currentTenantHeader: null,
      hasIdeas: false,
      hasProjects: false
    };
    this.subscriptions = [];
    this.ideasQueryParameters = { sort: 'trending', 'page[size]': 6 };
    this.projectsQueryParameters = { sort: 'new', 'page[number]': 1, 'page[size]': 2 };
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const ideas$ = ideasStream({ queryParameters: this.ideasQueryParameters }).observable;
    const projects$ = projectsStream({ queryParameters: this.ideasQueryParameters }).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        ideas$,
        projects$
      ).subscribe(([locale, currentTenant, ideas, projects]) => this.setState({
        locale,
        currentTenant,
        currentTenantHeader: (currentTenant.data.attributes.header_bg ? `${currentTenant.data.attributes.header_bg.large}?v=${Date.now()}` : null),        
        hasIdeas: (ideas !== null && ideas.data.length > 0),
        hasProjects: (projects !== null && projects.data.length > 0)
      }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToIdeasPage = () => {
    browserHistory.push('/ideas');
  }

  goToProjectsPage = () => {
    browserHistory.push('/projects');
  }

  goToAddIdeaPage = () => {
    browserHistory.push('/ideas/new');
  }

  render() {
    const { locale, currentTenant, currentTenantHeader, hasIdeas, hasProjects } = this.state;
    const { formatMessage } = this.props.intl;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const headerTitleMultiLoc = currentTenant.data.attributes.settings.core.header_title;
      const headerSloganMultiLoc = currentTenant.data.attributes.settings.core.header_slogan;
      const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const currentTenantLogo = currentTenant.data.attributes.logo.large;
      const currentTenantHeaderTitle = (headerTitleMultiLoc && headerTitleMultiLoc[locale]);
      const currentTenantHeaderSlogan = (headerSloganMultiLoc && headerSloganMultiLoc[locale]);
      const title = (currentTenantHeaderTitle ? currentTenantHeaderTitle : <FormattedMessage {...messages.titleCity} values={{ name: currentTenantName }} />);
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);
      const hasHeaderImage = (currentTenantHeader !== null);

      return (
        <div>
          <Container id="e2e-landing-page" hasHeader={hasHeaderImage}>
            {!currentTenantHeader && <BackgroundColor />}

            <Header src={currentTenantHeader}>
              {currentTenantHeader && <HeaderOverlay />}

              <HeaderContent>
                {/*
                {currentTenantLogo &&
                  <HeaderLogoWrapper>
                    <HeaderLogo imageSrc={currentTenantLogo} />
                  </HeaderLogoWrapper>
                }
                */}
                <HeaderTitle hasHeader={hasHeaderImage}>
                  {title}
                </HeaderTitle>
                <HeaderSubtitle hasHeader={hasHeaderImage}>
                  {subtitle}
                </HeaderSubtitle>
              </HeaderContent>
            </Header>

            <StyledContentContainer>
              <Section className="ideas">
                <SectionHeader>
                  <SectionTitle>
                    <FormattedMessage {...messages.trendingIdeas} />
                  </SectionTitle>
                  {hasIdeas &&
                    <Explore to="/ideas">
                      <ExploreText>
                        <FormattedMessage {...messages.exploreAllIdeas} />
                      </ExploreText>
                      <ExploreIcon name="compass" />
                    </Explore>
                  }
                </SectionHeader>
                <SectionContainer>
                  <IdeaCards filter={this.ideasQueryParameters} loadMoreEnabled={false} />
                </SectionContainer>
                {hasIdeas &&
                  <SectionFooter>
                    <ViewMoreButton
                      text={formatMessage(messages.exploreAllIdeas)}
                      style="primary"
                      size="3"
                      icon="compass"
                      onClick={this.goToIdeasPage}
                      circularCorners={false}
                    />
                  </SectionFooter>
                }
              </Section>

              {hasProjects &&
                <Section>
                  <SectionHeader>
                    <SectionTitle>
                      {/* <FormattedMessage {...messages.projectsFrom} values={{ name: currentTenantName }} /> */}
                      <FormattedMessage {...messages.cityProjects} />
                    </SectionTitle>
                    <Explore to="/projects">
                      <ExploreText>
                        <FormattedMessage {...messages.exploreAllProjects} />
                      </ExploreText>
                      <ExploreIcon name="compass" />
                    </Explore>
                  </SectionHeader>
                  <SectionContainer>
                    <ProjectCards filter={this.projectsQueryParameters} loadMoreEnabled={false} />
                  </SectionContainer>
                  <SectionFooter>
                    <ViewMoreButton
                      text={formatMessage(messages.exploreAllProjects)}
                      style="primary"
                      size="3"
                      icon="compass"
                      onClick={this.goToProjectsPage}
                      circularCorners={false}
                    />
                  </SectionFooter>
                </Section>
              }
            </StyledContentContainer>

            <Footer />

          </Container>
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(LandingPage);
