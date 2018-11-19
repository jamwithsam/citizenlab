import React from 'react';
import { isEmpty } from 'lodash-es';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import GetSerieFromStream from 'resources/GetSerieFromStream';
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear } from 'services/stats';
import messages from '../../messages';
import { rgba } from 'polished';

export type IGraphFormat = {
    name: string | number,
    value: number,
    code: string
  }[] | null;

interface DataProps {
  serie: IGraphFormat;
}

interface InputProps {
  // for data loading
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByBirthyear>;
  convertToGraphFormat: (IUsersByBirthyear) => IGraphFormat;
  startAt: string;
  endAt: string;
  currentGroupFilter: string | null;

  // for presentation purposes
  graphTitleMessageKey: string;
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  className: string;
}

interface Props extends InputProps, DataProps {}

class BarChartByCategory extends React.PureComponent<Props & InjectedIntlProps> {
  render() {
    const { chartFill, barFill, chartLabelSize, chartLabelColor } = this.props['theme'];
    const { className, graphTitleMessageKey, serie } = this.props;
    const noData = !serie || (serie.every(item => isEmpty(item)) || serie.length <= 0);
    const barHoverColor = rgba(chartFill, .25);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
            </GraphCardTitle>
          </GraphCardHeader>
          {noData ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer>
              <BarChart data={serie} margin={{ right: 40 }}>
                <Bar
                  dataKey="value"
                  name="name"
                  fill={chartFill}
                  label={{ fill: barFill, fontSize: chartLabelSize }}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <YAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{
                    fill: barHoverColor,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

const BarChartByCategoryWithHoCs = injectIntl<Props>(withTheme(BarChartByCategory as any) as any);

export default (inputProps: InputProps) => (
  <GetSerieFromStream {...inputProps}>
    {serie => <BarChartByCategoryWithHoCs {...serie} {...inputProps} />}
  </GetSerieFromStream>
);
