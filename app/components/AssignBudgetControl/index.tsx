import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined, get } from 'lodash-es';
import { isNilOrError, capitalizeParticipationContextType } from 'utils/helperUtils';
import { setMightOpenVerificationModal, verificationNeeded } from 'containers/App/events';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { addBasket, updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/pb/tracks';

// utils
import streams from 'utils/streams';
import { pastPresentOrFuture } from 'utils/dateUtils';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/pb/PBExpenses';
import Link from 'utils/cl-router/Link';
import { darken } from 'polished';

const IdeaCardContainer = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const BudgetBox = styled.div`
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.background};
  border: solid 1px ${colors.separation};
`;

const Budget = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
`;

const IdeaCardButton = styled(Button)`
  margin-right: 12px;
`;

const AssignedLabel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ControlWrapperHorizontalRule: any = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${colors.separation};
  margin: 20px 0;
`;

const AssignedIcon = styled(Icon)`
  height: 39px;
  color: ${colors.adminTextColor};
  margin-bottom: 4px;
`;

const AssignedText = styled.div`
  color: ${colors.clGreenSuccess};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  hyphens: auto;
`;

const ActionsWrapper = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  color: ${colors.label};
`;

const Separator = styled.div`
  font-size: ${fontSizes.xs}px;
  margin-left: 10px;
  margin-right: 10px;
`;

const ActionButton = styled.button`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  text-decoration: underline;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover, &:focus {
    color: ${darken(.5, colors.label)};
  }
`;

interface InputProps {
  view: 'ideaCard' | 'ideaPage';
  ideaId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  openIdea?: (event: FormEvent<any>) => void;
  unauthenticatedAssignBudgetClick?: () => void;
  disabledAssignBudgetClick?: () => void;
  className?: string;
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
  idea: GetIdeaChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Tracks {
  basketCreated: () => void;
  ideaRemovedFromBasket: () => void;
  ideaAddedToBasket: () => void;
  basketSubmitted: () => void;
  unauthenticatedAssignClick: () => void;
  disabledAssignClick: () => void;
}

interface Props extends DataProps, InputProps { }

interface State {
  processing: boolean;
}

class AssignBudgetControl extends PureComponent<Props & Tracks & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false
    };
  }

  disabledReasonNotVerified = () => {
    const { idea } = this.props;
    const disabledReason = !isNilOrError(idea) ? idea.attributes ?.action_descriptor ?.budgeting ?.disabled_reason : null;

    return disabledReason === 'not_verified';
  }

  isVerificationRequired = () => {
    const { participationContextId, participationContextType } = this.props;
    if (this.disabledReasonNotVerified()) {
      verificationNeeded('ActionBudget', participationContextId, participationContextType, 'budgeting');
    }
  }

  componentDidMount() {
    this.isVerificationRequired();
  }
  componentDidUpdate() {
    this.isVerificationRequired();
  }

  isDisabled = () => {
    const { participationContextType, project, phase } = this.props;

    if (participationContextType === 'phase' && !isNilOrError(phase) && pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]) === 'present') {
      return false;
    } else if (participationContextType === 'project' && !isNilOrError(project) && project.attributes.publication_status !== 'archived') {
      return false;
    }

    return true;
  }

  assignBudget = async (event: FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    const { ideaId, idea, authUser, basket, participationContextId, participationContextType, unauthenticatedAssignBudgetClick, disabledAssignBudgetClick } = this.props;
    const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
    const isInBasket = includes(basketIdeaIds, ideaId);
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const done = async () => {
      await timeout(200);
      this.setState({ processing: false });
    };

    if (!authUser) {
      setMightOpenVerificationModal('ActionBudget');
      unauthenticatedAssignBudgetClick && unauthenticatedAssignBudgetClick();
      this.props.unauthenticatedAssignClick();
    } else if (!isNilOrError(idea) && !isNilOrError(authUser)) {
      const budgetingEnabled = get(idea.attributes.action_descriptor.budgeting, 'enabled', null);

      if (budgetingEnabled === false) {
        disabledAssignBudgetClick && disabledAssignBudgetClick();
        this.props.disabledAssignClick();
      } else {
        this.setState({ processing: true });

        if (!isNilOrError(basket)) {
          let newIdeas: string[] = [];

          if (isInBasket) {
            newIdeas = basket.relationships.ideas.data.filter((basketIdea) => {
              return basketIdea.id !== idea.id;
            }).map((basketIdea) => {
              return basketIdea.id;
            });
          } else {
            newIdeas = [
              ...basket.relationships.ideas.data.map(basketIdea => basketIdea.id),
              idea.id
            ];
          }

          try {
            await updateBasket(basket.id, {
              user_id: authUser.id,
              participation_context_id: participationContextId,
              participation_context_type: capitalizeParticipationContextType(participationContextType),
              idea_ids: newIdeas,
              submitted_at: null
            });
            done();
            this.props.ideaAddedToBasket();
          } catch (error) {
            done();
            streams.fetchAllWith({ dataId: [basket.id] });
          }
        } else {
          try {
            await addBasket({
              user_id: authUser.id,
              participation_context_id: participationContextId,
              participation_context_type: capitalizeParticipationContextType(participationContextType),
              idea_ids: [idea.id]
            });
            done();
            this.props.basketCreated();
          } catch (error) {
            done();
          }
        }
      }
    }
  }

  onCardClick = (event: FormEvent<any>) => {
    this.props.openIdea && this.props.openIdea(event);
  }

  goBack = () => {
    const { project, participationContextType } = this.props;
    if (!isNilOrError(project)) {
      clHistory.push(`/projects/${project.attributes.slug}/${participationContextType === 'project' ? 'ideas' : 'process'}`);
    }
  }

  render() {
    const { processing } = this.state;
    const { view, ideaId, authUser, locale, tenant, idea, basket, className, participationContextId, participationContextType, intl: { formatMessage } } = this.props;

    if (
      !isUndefined(authUser) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isUndefined(basket) &&
      idea.attributes.budget
    ) {
      const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
      const isInBasket = includes(basketIdeaIds, ideaId);
      const disabled = this.isDisabled();
      const fullClassName = `e2e-assign-budget ${className}`;

      if (view === 'ideaCard') {
        return (
          <IdeaCardContainer className={fullClassName} aria-live="polite">
            <IdeaCardButton
              onClick={this.assignBudget}
              processing={processing}
              bgColor={disabled ? colors.disabledPrimaryButtonBg : (isInBasket ? colors.adminSecondaryTextColor : colors.adminTextColor)}
              bgHoverColor={disabled ? colors.disabledPrimaryButtonBg : undefined}
              icon={!isInBasket ? 'basket-plus' : 'remove'}
              className={`e2e-assign-budget-button ${isInBasket ? 'in-basket' : 'not-in-basket'}`}
              ariaLabel={!isInBasket ? formatMessage(messages.assign)
                : formatMessage(messages.undo)}
            />
          </IdeaCardContainer>
        );
      } else if (view === 'ideaPage') {
        return (
          <IdeaPageContainer className={fullClassName} aria-live="polite">
            {(isInBasket && !processing) ?
              <AssignedLabel>
                <AssignedIcon name="basket-checkmark" />
                <AssignedText>
                  <FormattedMessage {...messages.assigned} />
                </AssignedText>
                <ActionsWrapper>
                  <ActionButton
                    onClick={this.assignBudget}
                  >
                    <FormattedMessage {...messages.undo} />
                  </ActionButton>
                  <Separator aria-hidden>•</Separator>
                  <ActionButton
                    onClick={this.goBack}
                  >
                    <FormattedMessage {...messages.backToOverview} />
                  </ActionButton>
                </ActionsWrapper>
              </AssignedLabel>
              :
              <>
                <Budget>
                  <ScreenReaderOnly>
                    <FormattedMessage {...messages.a11y_price} />
                  </ScreenReaderOnly>
                  <BudgetBox>
                    <FormattedNumber
                      value={idea.attributes.budget}
                      style="currency"
                      currency={tenant.attributes.settings.core.currency}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </BudgetBox>
                </Budget>
                <Button
                  onClick={this.assignBudget}
                  processing={processing}
                  bgColor={disabled ? colors.disabledPrimaryButtonBg : (isInBasket ? colors.adminSecondaryTextColor : colors.adminTextColor)}
                  bgHoverColor={disabled ? colors.disabledPrimaryButtonBg : undefined}
                  icon="basket-plus"
                  fullWidth={true}
                  iconAriaHidden
                >
                  <FormattedMessage {...messages.assign} />
                </Button>
              </>
            }
            <ControlWrapperHorizontalRule aria-hidden />
            <PBExpenses
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              viewMode="column"
            />
          </IdeaPageContainer>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ projectId, render }) => <GetProject projectId={projectId}>{render}</GetProject>,
  phase: ({ participationContextType, participationContextId, render }) => <GetPhase id={participationContextType === 'phase' ? participationContextId : null}>{render}</GetPhase>,
  basket: ({ project, phase, participationContextType, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'project') {
      basketId = (!isNilOrError(project) && project.relationships.user_basket ? get(project.relationships.user_basket.data, 'id', null) : null);
    } else {
      basketId = (!isNilOrError(phase) && phase.relationships.user_basket ? get(phase.relationships.user_basket.data, 'id', null) : null);
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  }
});

const AssignBudgetControlWithHoCs = injectIntl(injectTracks<Props>({
  basketCreated: tracks.basketCreated,
  ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
  ideaAddedToBasket: tracks.ideaAddedToBasket,
  basketSubmitted: tracks.basketSubmitted,
  unauthenticatedAssignClick: tracks.unauthenticatedAssignClick,
  disabledAssignClick: tracks.disabledAssignClick
})(AssignBudgetControl));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssignBudgetControlWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
