import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import T from 'components/T';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { localeStream } from 'services/locale';
import { ideaStatusesStream, IIdeaStatusData } from 'services/ideaStatuses';

const Badge = styled.div`
  color: white;
  font-size: 13px;
  border-radius: 3px;
  padding: 3px 8px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
  background-color: ${(props: any) => props.color}
`;

type Props = {
  statusId: string,
  color: string,
  statusName: string,
  className?: string,
};

type State = {
  locale: string | null,
  ideaStatus: IIdeaStatusData | null;
};

export default class Status extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      ideaStatus: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const ideaStatuses$ = ideaStatusesStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(locale$, ideaStatuses$).subscribe(([locale, ideaStatuses]) => {
        const ideaStatus = ideaStatuses.data.filter((item) => item.id === this.props.statusId)[0];
        this.setState({ locale, ideaStatus });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { statusId, statusName, className } = this.props;
    const { locale, ideaStatus } = this.state;
    const fallbackColor = '#bbbbbb';

    return (ideaStatus !== null && locale !== null) ? (
      <Badge className={className} color={ideaStatus.attributes.color || fallbackColor} >
        <T value={ideaStatus.attributes.title_multiloc} />
      </Badge>
    ) : null;
  }
}
