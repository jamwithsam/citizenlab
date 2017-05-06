/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Saga } from 'react-redux-saga';

import WatchSagas from 'containers/WatchSagas'

import * as sagas from './sagas';

import { loadComments, loadVotes, loadIdea } from './actions';

import makeSelectIdeasShow from './selectors';

import Show from './components/show';


// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();
    const { params } = props;
    this.id = params.slug
  }

  componentDidMount() {
    // this.props.loadIdea(this.id);
    // this.props.loadComments(this.id);
    // this.props.loadVotes(this.id);
  }

  render() {
    return (
      <div>
       
      </div>
    );
  }
}

IdeasShow.propTypes = {
  loadComments: PropTypes.func.isRequired,
  loadVotes: PropTypes.func.isRequired,
  params: PropTypes.object,
  loadIdea: PropTypes.func,
};

const ideasShowActions = { loadIdea, loadComments, loadVotes };
const mapDispatchToProps = (dispatch) => bindActionCreators(ideasShowActions, dispatch);


export default connect(null, mapDispatchToProps)(IdeasShow);
