import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isString, isFunction } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// tracking
import { trackPage } from 'utils/analytics';

// services
import { IProjectData, reorderProject } from 'services/projects';
import { deleteProjectFolder } from 'services/projectFolders';
import { IProjectHolderOrderingData, reorderProjectHolder } from 'services/projectHolderOrderings';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProjectFolder from 'resources/GetProjectFolder';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isAdmin, isModerator } from 'services/permissions/roles';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import { HeaderTitle } from './styles';
import CreateProject from './CreateProject';
import PageWrapper from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';
import HasPermission from 'components/HasPermission';
import IconTooltip from 'components/UI/IconTooltip';
import ProjectRow from '../components/ProjectRow';
import FolderRow from '../components/FolderRow';
import ProjectTemplatePreviewPageAdmin from 'components/ProjectTemplatePreview/ProjectTemplatePreviewPageAdmin';
import FeatureFlag from 'components/FeatureFlag';

// style
import styled from 'styled-components';

const Container = styled.div``;

const CreateAndEditProjectsContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const ProjectTemplatePreviewContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const StyledCreateProject = styled(CreateProject)`
  margin-bottom: 18px;
`;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  projectsWithoutFolder: GetProjectsChildProps;
  publishedProjectsUserCanModerate: GetProjectsChildProps;
  publishedProjectsWithoutFolder: GetProjectsChildProps;
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  selectedProjectTemplateId: string | null;
}

const useCapture = false;

class AdminProjectsList extends PureComponent<Props, State> {
  subscriptions: Subscription[];
  unlisten: Function | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedProjectTemplateId: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent<string>('ProjectTemplateCardClicked').subscribe(({ eventValue }) => {
        if (isString(eventValue)) {
          const selectedProjectTemplateId = eventValue;
          const { locale } = this.props;
          const url = `/admin/projects/templates/${selectedProjectTemplateId}`;

          if (!isNilOrError(locale) && url) {
            this.url = `${window.location.origin}/${locale}${url}`;
            this.goBackUrl = 'window.location.href';
            this.goBackUrl = `${window.location.origin}/${locale}${removeLocale(window.location.pathname).pathname}`;
            window.history.pushState({ path: this.url }, '', this.url);
            window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
            window.addEventListener('keydown', this.handleKeypress, useCapture);
            this.unlisten = clHistory.listen(() => this.closeTemplatePreview());
            trackPage(this.url);
          }

          window.scrollTo(0, 0);
          this.setState({ selectedProjectTemplateId });
        }
      })
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.selectedProjectTemplateId && !this.state.selectedProjectTemplateId) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.cleanup();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleReorderProjects = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  handleReorderHolders = (itemId, newOrder) => {
    reorderProjectHolder(itemId, newOrder);
  }

  closeTemplatePreview = () => {
    this.setState({ selectedProjectTemplateId: null });
  }

  cleanup = () => {
    if (this.goBackUrl) {
      window.removeEventListener('popstate', this.handlePopstateEvent, useCapture);
      window.removeEventListener('keydown', this.handleKeypress, useCapture);

      if (window.location.href === this.url) {
        window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      }
    }

    this.url = null;
    this.goBackUrl = null;

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }
  }

  handlePopstateEvent = () => {
    this.closeTemplatePreview();
  }

  handleKeypress = (event: KeyboardEvent) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeTemplatePreview();
    }
  }

  removeFolder = (folderId: string) => () => {
    deleteProjectFolder(folderId);
  }

  render() {
    const { selectedProjectTemplateId } = this.state;
    const {
      authUser,
      projectsWithoutFolder: { projectsList: projectsWithoutFolderList },
      className,
      projectHolderOrderings,
      publishedProjectsWithoutFolder,
      publishedProjectsUserCanModerate
    } = this.props;
    const userIsAdmin = !isNilOrError(authUser) ? isAdmin({ data: authUser }) : false;
    let lists: JSX.Element | null = null;
    const hasProjectsOrFolders = !isNilOrError(projectHolderOrderings) && projectHolderOrderings.length > 0;

    if (!isNilOrError(projectsWithoutFolderList) && !isNilOrError(projectHolderOrderings)) {
      const draftProjectsWithoutFolder = projectsWithoutFolderList.filter((project) => {
        return project.attributes.publication_status === 'draft';
      });
      const archivedProjectsWithoutFolder = projectsWithoutFolderList.filter((project) => {
        return project.attributes.publication_status === 'archived';
      });

      lists = (
        <ListsContainer>
          {projectHolderOrderings && projectHolderOrderings.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.published} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.publishedTooltip} />} />

                <Spacer />

                <FeatureFlag name="project_folders">
                  <Button
                    linkTo={'/admin/projects/folders/new'}
                  >
                    <FormattedMessage {...messages.newProjectFolder} />
                  </Button>
                </FeatureFlag>

              </ListHeader>

              <HasPermission item="project" action="reorder">
                <SortableList
                  items={projectHolderOrderings}
                  onReorder={this.handleReorderHolders}
                  className="projects-list e2e-admin-projects-list"
                  id="e2e-admin-published-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((item: IProjectHolderOrderingData, index: number) => {
                      if (item.relationships.project_holder.data.type === 'project') {
                        const project = !isNilOrError(publishedProjectsWithoutFolder.projectsList)
                          && publishedProjectsWithoutFolder.projectsList.find(project => project.id === item.relationships.project_holder.data.id);

                        if (!project) return <div />;

                        return (
                          <SortableRow
                            key={item.id}
                            id={item.id}
                            index={index}
                            moveRow={handleDragRow}
                            dropRow={handleDropRow}
                            lastItem={(index === projectHolderOrderings.length - 1)}
                          >
                            <ProjectRow project={project} />
                          </SortableRow>
                        );
                      } else {
                        if (userIsAdmin) {
                          return (
                            <GetProjectFolder projectFolderId={item.relationships.project_holder.data.id} key={item.relationships.project_holder.data.id}>
                              {projectFolder => isNilOrError(projectFolder) ? null : (
                                <SortableRow
                                  id={item.id}
                                  index={index}
                                  moveRow={handleDragRow}
                                  dropRow={handleDropRow}
                                  lastItem={(index === projectHolderOrderings.length - 1)}
                                >
                                  <FolderRow folder={projectFolder} />
                                </SortableRow>
                              )}
                            </GetProjectFolder>
                          );
                        }

                        return <div />;
                      }
                    }
                  ))}
                </SortableList>
                <HasPermission.No>
                  <List>

                    {projectHolderOrderings.map((holder, index) => {
                      if (holder.relationships.project_holder.data.type === 'project') {
                        const project = !isNilOrError(publishedProjectsWithoutFolder.projectsList)
                          && publishedProjectsWithoutFolder.projectsList.find(project => project.id === holder.relationships.project_holder.data.id);
                        if (!project) return null;

                        return (
                          <Row
                            id={project.id}
                            lastItem={(index === projectHolderOrderings.length - 1)}
                          >
                            <ProjectRow project={project} />
                          </Row>
                        );
                      } else {
                        if (userIsAdmin) {
                          return (
                            <GetProjectFolder projectFolderId={holder.relationships.project_holder.data.id} key={holder.relationships.project_holder.data.id}>
                              {projectFolder => isNilOrError(projectFolder) ? null : (
                                <Row
                                  id={projectFolder.id}
                                  lastItem={(index === projectHolderOrderings.length - 1)}
                                >
                                  <FolderRow folder={projectFolder} />
                                </Row>
                              )}
                            </GetProjectFolder>
                          );
                        }

                        return <div />;
                        }
                    })}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }

          {draftProjectsWithoutFolder && draftProjectsWithoutFolder.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.draft} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.draftTooltip} />} />
              </ListHeader>
              <HasPermission item="project" action="reorder">
                <SortableList
                  items={draftProjectsWithoutFolder}
                  onReorder={this.handleReorderProjects}
                  className="e2e-admin-projects-list"
                  id="e2e-admin-draft-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        className="e2e-admin-projects-list-item"
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={(index === draftProjectsWithoutFolder.length - 1)}
                      >
                        <ProjectRow project={project} />
                      </SortableRow>
                    ))
                  )}
                </SortableList>
                <HasPermission.No>
                  <List>
                    {draftProjectsWithoutFolder.map((project, index) => (
                      <Row key={project.id} lastItem={(index === draftProjectsWithoutFolder.length - 1)}>
                        <ProjectRow project={project} />
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }

          {archivedProjectsWithoutFolder && archivedProjectsWithoutFolder.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.archived} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.archivedTooltip} />} />
              </ListHeader>
              <HasPermission item="project" action="reorder">
                <SortableList
                  items={archivedProjectsWithoutFolder}
                  onReorder={this.handleReorderProjects}
                  className="e2e-admin-projects-list"
                  id="e2e-admin-archived-projects-list"
                >
                  {({ itemsList, handleDragRow, handleDropRow }) => (
                    itemsList.map((project: IProjectData, index: number) => (
                      <SortableRow
                        key={project.id}
                        id={project.id}
                        className="e2e-admin-projects-list-item"
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        lastItem={index === archivedProjectsWithoutFolder.length - 1}
                      >
                        <ProjectRow project={project} />
                      </SortableRow>
                    ))
                  )}
                </SortableList>

                <HasPermission.No>
                  <List id="e2e-admin-archived-projects-list">
                    {archivedProjectsWithoutFolder.map((project, index) => (
                      <Row
                        key={project.id}
                        className="e2e-admin-projects-list-item"
                        lastItem={(index === archivedProjectsWithoutFolder.length - 1)}
                      >
                        <ProjectRow project={project} />
                      </Row>
                    ))}
                  </List>
                </HasPermission.No>
              </HasPermission>
            </>
          }
        </ListsContainer>
      );
    }

    return (
      <Container className={className}>
        <CreateAndEditProjectsContainer className={selectedProjectTemplateId ? 'hidden' : ''}>
          <PageTitle>
            <FormattedMessage {...messages.overviewPageTitle} />
          </PageTitle>

          <SectionSubtitle>
            <HasPermission item={{ type: 'route', path: '/admin/projects/new' }} action="access">
              <FormattedMessage {...messages.overviewPageSubtitle} />
              <HasPermission.No>
                <FormattedMessage {...messages.overviewPageSubtitleModerator} />
              </HasPermission.No>
            </HasPermission>
          </SectionSubtitle>

          {userIsAdmin && <StyledCreateProject />}

          {hasProjectsOrFolders &&
            <PageWrapper>
              {lists}
            </PageWrapper>
          }
        </CreateAndEditProjectsContainer>

        <ProjectTemplatePreviewContainer className={!selectedProjectTemplateId ? 'hidden' : ''}>
          {selectedProjectTemplateId &&
            <ProjectTemplatePreviewPageAdmin
              projectTemplateId={selectedProjectTemplateId}
              goBack={this.closeTemplatePreview}
            />
          }
        </ProjectTemplatePreviewContainer>
      </Container>
    );
  }
}

const publicationStatuses: PublicationStatus[] = ['draft', 'archived'];

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  projectHolderOrderings: <GetProjectHolderOrderings />,
  publishedProjectsWithoutFolder: ({ projectHolderOrderings, render }) => {
    const projectIds = isNilOrError(projectHolderOrderings)
      ? []
      : projectHolderOrderings
        .filter(item => item.relationships.project_holder.data.type === 'project')
        .map(item => item.relationships.project_holder.data.id);
    return <GetProjects publicationStatuses={['published']} filteredProjectIds={projectIds} filterCanModerate={true}>{render}</GetProjects>;
  },
  projectsWithoutFolder: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} folderId="nil"/>,
  publishedProjectsUserCanModerate: ({ authUser, render }) => {
    /* publishedProjectsUserCanModerate is used to temporarily display a flat project list for project moderators */
    const userIsProjectMod = !isNilOrError(authUser) ? isModerator({ data: authUser }) : false;

    if (userIsProjectMod) {
      return <GetProjects publicationStatuses={['published']} filterCanModerate={true}>{render}</GetProjects>;
    }

    return null;
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectsList {...inputProps} {...dataProps} />}
  </Data>
);
