import React from 'react';
import { get, isString, isEmpty, omitBy, isNil, isEqual, isBoolean, omit, cloneDeep } from 'lodash-es';
import { Subscription, Subject, BehaviorSubject, combineLatest, merge } from 'rxjs';
import { map, startWith, distinctUntilChanged, tap, debounceTime, mergeScan, switchMap } from 'rxjs/operators';
import { ideasNeedingFeedbackCount } from 'services/stats';
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import shallowCompare from 'utils/shallowCompare';

export interface InputProps {
  projectId?: string;
  phaseId?: string;
  authorId?: string;
  search?: string;
  topics?: string[];
  areas?: string[];
  ideaStatusId?: string;
  projectPublicationStatus?: ProjectPublicationStatus;
  boundingBox?: number[];
  cache?: boolean;
  assignee?: string;
  feedbackNeeded?: boolean;
}

interface IQueryParameters {
  project: string | undefined;
  phase: string | undefined;
  author: string | undefined;
  search: string | undefined;
  topics: string[] | undefined;
  areas: string[] | undefined;
  idea_status: string | undefined;
  project_publication_status: ProjectPublicationStatus | undefined;
  bounding_box: number[] | undefined;
  assignee: string | undefined;
  feedback_needed: boolean | undefined;
}

type children = (renderProps: GetIdeasNeedingFeedbackCountChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetIdeasNeedingFeedbackCountChildProps) => JSX.Element | null;
}

export type GetIdeasNeedingFeedbackCountChildProps = State & {
  onChangeProject: (projectId: string) => void;
  onChangePhase: (phaseId: string) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeIdeaStatus: (ideaStatus: string) => void;
  onChangeProjectPublicationStatus: (ProjectPublicationStatus: ProjectPublicationStatus) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean | undefined) => void;
};

interface State {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  count: number | undefined | null;
  querying: boolean;
}

export default class GetIdeasNeedingFeedbackCount extends React.Component<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: Subject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        project: undefined,
        phase: undefined,
        author: undefined,
        search: undefined,
        topics: undefined,
        areas: undefined,
        idea_status: undefined,
        project_publication_status: undefined,
        bounding_box: undefined,
        assignee: undefined,
        feedback_needed: undefined
      },
      searchValue: undefined,
      count: undefined,
      querying: true,
    };
    const queryParameters = this.getQueryParameters(this.state, props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const queryParametersInput$ = this.queryParameters$.pipe(
      distinctUntilChanged((x, y) => shallowCompare(x, y)),
    );
    const queryParametersSearch$ = queryParametersInput$.pipe(
      map(queryParameters => queryParameters.search),
      distinctUntilChanged()
    );
    const search$ = merge(
      this.search$.pipe(
        tap(searchValue => this.setState({ searchValue })),
        debounceTime(500)
      ),
      queryParametersSearch$.pipe(
        tap(searchValue => this.setState({ searchValue }))
      )
    ).pipe(
      startWith(queryParameters.search),
      map(searchValue => ((isString(searchValue) && !isEmpty(searchValue)) ? searchValue : undefined)),
      distinctUntilChanged()
    );

    const queryParametersOutput$ = combineLatest(
      queryParametersInput$,
      search$
    ).pipe(
      map(([queryParameters, search]) => ({ ...queryParameters, search }))
    );

    this.subscriptions = [
      queryParametersOutput$.pipe(
        switchMap((queryParameters) => {
          return ideasNeedingFeedbackCount({
            queryParameters,
          }).observable.pipe(
            map(ideasNeedingFeedbackCount => ({ queryParameters, ideasNeedingFeedbackCount }))
          );
        })
      )
      .subscribe(({ ideasNeedingFeedbackCount, queryParameters }) => {
        this.setState({
          queryParameters,
          count: ideasNeedingFeedbackCount.count,
          querying: false
        });
      })
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    const InputPropsQueryParameters: IQueryParameters = {
      project: props.projectId,
      phase: props.phaseId,
      author: props.authorId,
      search: props.search,
      topics: props.topics,
      areas: props.areas,
      idea_status: props.ideaStatusId,
      project_publication_status: props.projectPublicationStatus,
      bounding_box: props.boundingBox,
      assignee: props.assignee,
      feedback_needed: props.feedbackNeeded
    };

    return {
      ...state.queryParameters,
      ...omitBy(InputPropsQueryParameters, isNil)
    };
  }

  handleProjectOnChange = (projectId: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      project: projectId
    });
  }

  handlePhaseOnChange = (phaseId: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      phase: phaseId
    });
  }

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics
    });
  }

  handleAreasOnchange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas
    });
  }

  handleIdeaStatusOnChange = (ideaStatus: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      idea_status: ideaStatus,
    });
  }

  handleProjectPublicationStatusOnChange = (projectPublicationStatus: ProjectPublicationStatus) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      project_publication_status: projectPublicationStatus,
    });
  }

  handleAssigneeOnChange = (assignee: string | undefined) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      assignee,
    });
  }
  handleFeedbackFilterOnChange = (feedbackNeeded: boolean | undefined) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      feedback_needed: feedbackNeeded,
    });
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeProject: this.handleProjectOnChange,
      onChangePhase: this.handlePhaseOnChange,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeTopics: this.handleTopicsOnChange,
      onChangeAreas: this.handleAreasOnchange,
      onChangeIdeaStatus: this.handleIdeaStatusOnChange,
      onChangeProjectPublicationStatus: this.handleProjectPublicationStatusOnChange,
      onChangeAssignee: this.handleAssigneeOnChange,
      onChangeFeedbackFilter: this.handleFeedbackFilterOnChange,
    });
  }
}
