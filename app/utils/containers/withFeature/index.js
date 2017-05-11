
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

import RuleBasedRenderer from 'utils/containers/ruleBasedRenderer';

import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import authorizations from './authorizations';

const mapStateToProps = () => createStructuredSelector({
  base: (state, { feature }) => makeSelectCurrentTenantImm('attributes', 'settings', feature)(state),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { feature, children } = ownP;
  const { base } = stateP;
  //console.log(base)
  let action = ['withoutFeature'];
  if (feature) action = ['feature'];
  // console.log(action)
  return { action, authorizations, base, children };
};


const WithFeature = preprocess(mapStateToProps, null, mergeProps)(RuleBasedRenderer);

export default WithFeature;
export { WithFeature as Without };
