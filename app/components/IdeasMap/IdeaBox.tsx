// Libs
import * as React from 'react';

// Components
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import T from 'components/T';
import Button from 'components/UI/Button';
import { Button as SemanticButton, Icon } from 'semantic-ui-react';
import VoteControl from 'components/VoteControl';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const Wrapper = styled.div`
  align-items: strech;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 30px;
  position: relative;
`;

const Title = styled.h2``;

const Description = styled.div`
  flex: 0 1 auto;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const VoteComments = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
const StyledButton = styled(Button)`
  justify-self: flex-end;
`;

const CommentsCound = styled.span`
  color: ${color('label')};
  font-size: ${fontSize('base')};
`;

const CloseButton = styled(SemanticButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

// Typings
export interface Props {
  idea: string;
  className?: string;
  onClose?: {(event): void};
}

export default class IdeaBox extends React.Component<Props> {
  render() {
    return (
      <GetIdea id={this.props.idea}>
        {({ idea }) => {
          if (!idea) {
            return null;
          } else {
            return (
              <Wrapper className={this.props.className}>
                {this.props.onClose && <CloseButton onClick={this.props.onClose} icon="close" circular basic />}
                <Title><T value={idea.attributes.title_multiloc} /></Title>
                <Description><T value={idea.attributes.body_multiloc} /></Description>
                <VoteComments>
                  <VoteControl ideaId={idea.id} size="small" />
                  <CommentsCound>
                    <Icon name="comments" />
                    {idea.attributes.comments_count}
                  </CommentsCound>
                </VoteComments>
                <StyledButton circularCorners={false} width="100%" linkTo={`/ideas/${idea.attributes.slug}`}>
                  <FormattedMessage {...messages.seeIdea} />
                </StyledButton>
              </Wrapper>
            );
          }
        }}
      </GetIdea>
    );
  }
}
