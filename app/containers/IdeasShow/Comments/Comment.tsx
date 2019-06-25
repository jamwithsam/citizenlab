// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// components
import CommentHeader from './CommentHeader';
import CommentBody from './CommentBody';
import CommentFooter from './CommentFooter';
import Icon from 'components/UI/Icon';

// services
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  &.child {
    background: #fbfbfb;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
`;

const ContainerInner = styled.div`
  padding-top: 25px;
  padding-bottom: 35px;
  position: relative;

  &.hasBottomBorder {
    border-bottom: solid 1px #e8e8e8;
  }

  &.lastComment {
    border-bottom: none;
  }

  &.parent {
    padding-left: 50px;
    padding-right: 50px;
  }

  &.child {
    margin-left: 90px;
    margin-right: 50px;
  }

  ${media.smallerThanMinTablet`
    padding-top: 20px;
    padding-bottom: 25px;

    &.parent {
      padding-left: 20px;
      padding-right: 20px;
    }

    &.child {
      margin-left: 40px;
      margin-right: 20px;
    }
  `}

  ${media.phone`
    &.child {
      margin-left: 20px;
    }
  `}
`;

const Content = styled.div`
  display: flex;
`;

const BodyAndFooter = styled.div`
  flex: 1;
`;

const DeletedComment = styled.div`
  color: ${colors.label};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  font-style: italic;
`;

const DeletedIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  fill: ${colors.label};
`;

interface InputProps {
  ideaId: string;
  projectId: string;
  commentId: string;
  commentType: 'parent' | 'child';
  hasBottomBorder?: boolean;
  hasChildComments?: boolean;
  canReply?: boolean;
  last?: boolean;
  className?: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  editing: boolean;
}

class Comment extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    hasBottomBorder: true,
    hasChildComment: false,
    canReply: true,
    last: false
  };

  constructor(props) {
    super(props);
    this.state = {
      editing: false
    };
  }

  onEditing = () => {
    this.setState({ editing: true });
  }

  onCancelEditing = () => {
    this.setState({ editing: false });
  }

  onCommentSaved = () => {
    this.setState({ editing: false });
  }

  render() {
    const { comment, author, ideaId, projectId, commentType, hasBottomBorder, hasChildComments, last, className, canReply } = this.props;
    const { editing } = this.state;

    if (!isNilOrError(comment)) {
      const commentId = comment.id;
      const authorId = (!isNilOrError(author) ? author.id : null);
      const lastComment = ((commentType === 'parent' && !hasChildComments) || (commentType === 'child' && last === true));
      const moderator = !isNilOrError(author) && canModerate(projectId, { data: author });

      return (
        <Container className={`${className} ${commentType} ${commentType === 'parent' ? 'e2e-parentcomment' : 'e2e-childcomment'} e2e-comment`}>
          <ContainerInner className={`${commentType} ${lastComment ? 'lastComment' : ''} ${hasBottomBorder ? 'hasBottomBorder' : ''}`}>
            {comment.attributes.publication_status === 'published' &&
              <>
                <CommentHeader
                  projectId={projectId}
                  authorId={authorId}
                  commentId={commentId}
                  commentType={commentType}
                  commentCreatedAt={comment.attributes.created_at}
                  moderator={moderator}
                />

                <Content>
                  <BodyAndFooter>
                    <CommentBody
                      commentId={commentId}
                      commentType={commentType}
                      editing={editing}
                      onCommentSaved={this.onCommentSaved}
                      onCancelEditing={this.onCancelEditing}
                    />
                    <CommentFooter
                      className={commentType}
                      projectId={projectId}
                      ideaId={ideaId}
                      commentId={commentId}
                      commentType={commentType}
                      onEditing={this.onEditing}
                      canReply={canReply}
                    />
                  </BodyAndFooter>
                </Content>
              </>
            }

            {comment.attributes.publication_status === 'deleted' &&
              <DeletedComment>
                <DeletedIcon name="delete" />
                <FormattedMessage {...messages.commentDeletedPlaceholder} />
              </DeletedComment>
            }
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>
});

const CommentWithHoCs = injectIntl<Props>(Comment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
