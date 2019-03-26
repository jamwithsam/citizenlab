import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
// import FeatureFlag from 'components/FeatureFlag';
import CommentsMoreActions from './CommentsMoreActions';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from '../tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const TranslateButtonWrapper = styled.div``;

const TranslateButton = styled.button`
  padding: 0;
  color: ${colors.clBlue};
  text-decoration: underline;
  margin-top: 10px;

  &:hover {
    cursor: pointer;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

interface InputProps {
  ideaId: string;
  commentId: string;
  onEditing: () => void;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  comment: GetCommentChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  translateButtonClicked: boolean;
}

class CommentFooter extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      translateButtonClicked: false,
    };
  }

  translateComment = () => {
    const { translateButtonClicked } = this.state;

    if (translateButtonClicked) {
      trackEvent(tracks.clickGoBackToOriginalCommentButton);
    } else {
      trackEvent(tracks.clickTranslateCommentButton);
    }

    this.setState(prevState => ({
      translateButtonClicked: !prevState.translateButtonClicked,
    }));
  }

  onCommentEdit = () => {
    this.props.onEditing();
  }

  render() {
    const { className, comment, idea, locale, intl } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(comment) && !isNilOrError(idea) && !isNilOrError(locale)) {
      const projectId = idea.relationships.project.data.id;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const showTranslateButton = commentBodyMultiloc && !commentBodyMultiloc[locale];

      return (
        <Container className={className}>
          {/* <FeatureFlag name="machine_translations"> */}
            {showTranslateButton &&
              <TranslateButtonWrapper>
                <TranslateButton
                  onClick={this.translateComment}
                >
                  {!translateButtonClicked
                    ? <FormattedMessage {...messages.translateComment} />
                    : <FormattedMessage {...messages.showOriginalComment} />
                  }
                </TranslateButton>
              </TranslateButtonWrapper>
            }
          {/* </FeatureFlag> */}

          <Footer>
            <Left />
            <Right>
              <CommentsMoreActions
                ariaLabel={intl.formatMessage(messages.showMoreActions)}
                comment={comment}
                onCommentEdit={this.onCommentEdit}
                projectId={projectId}
              />
            </Right>
          </Footer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>
});

const CommentFooterWithHoCs = injectIntl<Props>(CommentFooter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentFooterWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
