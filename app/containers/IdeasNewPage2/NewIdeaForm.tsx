import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import * as bowser from 'bowser';

// components
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';

// services
import { localState, ILocalStateService } from 'services/localState';
import { globalState, IGlobalStateService, IIdeasNewPageGlobalState } from 'services/globalState';
import { localeStream } from 'services/locale';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectsStream, IProjects, IProjectData } from 'services/projects';

// utils
import { IStream } from 'utils/streams';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IOption, ImageFile } from 'typings';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div``;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  padding-top: 40px;
  margin-bottom: 40px;
`;

const FormElement: any = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const MobileButton = styled.div`
  width: 100%;
  display: none;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

interface Props {
  onSubmit: () => void;
}

interface LocalState {
  topics: IOption[] | null;
  projects: IOption[] | null;
}

interface GlobalState {
  title: string | null;
  description: EditorState;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: any;
  imageFile: ImageFile[] | null;
  titleError: string | null;
  descriptionError: string | null;
  submitError: boolean;
  processing: boolean;
}

interface State extends LocalState, GlobalState {}

class NewIdeaForm extends React.PureComponent<Props & InjectedIntlProps, State> {
  localState: ILocalStateService<LocalState>;
  globalState: IGlobalStateService<IIdeasNewPageGlobalState>;
  subscriptions: Rx.Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: any | null;

  constructor(props: Props) {
    super(props as any);
    this.localState = localState<LocalState>({ topics: null, projects: null });
    this.globalState = globalState.init<IIdeasNewPageGlobalState>('IdeasNewPage');
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentWillMount() {
    const localState$ = this.localState.observable;
    const globalState$ = this.globalState.observable;
    const locale$ = localeStream().observable;
    const topics$ = topicsStream().observable;
    const projects$ = projectsStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        localState$, 
        globalState$
      ).map(([localState, globalState]) => {
        return {
          ...localState,
          ...globalState
        };
      }).subscribe(({ 
        topics,
        projects,
        title,
        description,
        selectedTopics,
        selectedProject,
        location,
        imageFile,
        titleError,
        descriptionError,
        submitError,
        processing
      }) => {
        const newState: State = {
          topics,
          projects,
          title,
          description,
          selectedTopics,
          selectedProject,
          location,
          imageFile,
          titleError,
          descriptionError,
          submitError,
          processing
        };

        this.setState(newState);
      }),

      Rx.Observable.combineLatest(
        locale$,
        topics$,
      ).subscribe(([locale, topics]) => {
        this.localState.set({
          topics: this.getOptions(topics, locale)
        });
      }),

      Rx.Observable.combineLatest(
        locale$,
        projects$,
      ).subscribe(([locale, projects]) => {
        this.localState.set({
          projects: this.getOptions(projects, locale)
        });
      }),

      eventEmitter.observe('IdeasNewPage', 'submit').subscribe(this.handleOnSubmit),
    ];
  }

  componentDidMount() {
    if (!bowser.mobile && this.titleInputElement !== null) {
      setTimeout(() => (this.titleInputElement as HTMLInputElement).focus(), 50);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions = (list: ITopics | IProjects | null, locale: string | null) => {
    if (list && locale) {
      return (list.data as (ITopicData | IProjectData)[]).map(item => ({
        value: item.id,
        label: item.attributes.title_multiloc[locale]
      } as IOption));
    }

    return null;
  }

  handleTitleOnChange = (title: string) => {
    this.globalState.set({ title, titleError: null });
  }

  handleDescriptionOnChange = async (description: EditorState) => {
    const globalState = await this.globalState.get();
    const descriptionError = (description.getCurrentContent().hasText() ? null : globalState.descriptionError);
    this.globalState.set({ description, descriptionError });
  }

  handleTopicsOnChange = (selectedTopics: IOption[]) => {
    this.globalState.set({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject: IOption) => {
    this.globalState.set({ selectedProject });
  }

  handleLocationOnChange = (location: string) => {
    this.globalState.set({ location });
  }

  handleUploadOnAdd = (newImage: ImageFile) => {
    this.globalState.set({
      imageFile: [newImage],
      imageBase64: newImage.base64,
      imageChanged: true
    });
  }

  handleUploadOnUpdate = (updatedImages: ImageFile[]) => {
    this.globalState.set({
      imageBase64: updatedImages[0].base64
    });
  }

  handleUploadOnRemove = (removedImage: ImageFile) => {
    this.globalState.set({
      imageFile: null,
      imageBase64: null,
      imageChanged: true
    });
  }

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleDescriptionInputSetRef = (element) => {
    this.descriptionElement = element;
  }

  validate = (title: string | null, description: EditorState) => {
    const { formatMessage } = this.props.intl;
    const titleError = (!title ? formatMessage(messages.titleEmptyError) : null);
    const hasDescriptionError = (!description || !description.getCurrentContent().hasText());
    const descriptionError = (hasDescriptionError ? formatMessage(messages.descriptionEmptyError) : null);

    this.globalState.set({ titleError, descriptionError });

    if (titleError) {
      scrollToComponent(this.titleInputElement, { align: 'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError) {
      scrollToComponent(this.descriptionElement.editor.refs.editor, { align: 'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement && this.descriptionElement.focusEditor(), 300);
    }

    return (!titleError && !descriptionError);
  }

  handleOnSubmit = () => {
    const { title, description } = this.state;

    if (this.validate(title, description)) {
      this.props.onSubmit();
    }
  }

  render() {
    if (!this.state) { return null; }

    const { formatMessage } = this.props.intl;
    const { topics, projects, title, description, selectedTopics, selectedProject, location, imageFile, titleError, descriptionError, submitError, processing } = this.state;
    const submitErrorMessage = (submitError ? formatMessage(messages.submitError) : null);

    return (
      <Container>
        <Form id="new-idea-form">
          <Title>{formatMessage(messages.formTitle)}</Title>

          <FormElement name="titleInput">
            <Label value={formatMessage(messages.titleLabel)} htmlFor="title" />
            <Input
              id="title"
              type="text"
              value={title}
              placeholder={formatMessage(messages.titlePlaceholder)}
              error={titleError}
              onChange={this.handleTitleOnChange}
              setRef={this.handleTitleInputSetRef}
            />
          </FormElement>

          <FormElement name="descriptionInput">
            <Label value={formatMessage(messages.descriptionLabel)} htmlFor="editor" />
            <Editor
              id="editor"
              value={description}
              placeholder={formatMessage(messages.descriptionPlaceholder)}
              error={descriptionError}
              onChange={this.handleDescriptionOnChange}
              setRef={this.handleDescriptionInputSetRef}
            />
          </FormElement>

          {topics && topics.length > 0 &&
            <FormElement>
              <Label value={formatMessage(messages.topicsLabel)} htmlFor="topics" />
              <MultipleSelect
                value={selectedTopics}
                placeholder={formatMessage(messages.topicsPlaceholder)}
                options={topics}
                max={2}
                onChange={this.handleTopicsOnChange}
              />
            </FormElement>
          }

          {projects && projects.length > 0 &&
            <FormElement>
              <Label value={formatMessage(messages.projectsLabel)} htmlFor="projects" />
              <Select
                value={selectedProject}
                placeholder={formatMessage(messages.projectsPlaceholder)}
                options={projects}
                onChange={this.handleProjectOnChange}
              />
            </FormElement>
          }

          <FormElement>
            <Label value={formatMessage(messages.locationLabel)} htmlFor="location" />
            <LocationInput
              id="location"
              value={location}
              placeholder={formatMessage(messages.locationPlaceholder)}
              onChange={this.handleLocationOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.imageUploadLabel)} />
            <ImagesDropzone
              images={imageFile}
              imagePreviewRatio={135 / 298}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              maxImageFileSize={5000000}
              maxNumberOfImages={1}
              placeholder={formatMessage(messages.imageUploadPlaceholder)}
              onAdd={this.handleUploadOnAdd}
              onUpdate={this.handleUploadOnUpdate}
              onRemove={this.handleUploadOnRemove}
            />
          </FormElement>

          <MobileButton>
            <Button
              className="e2e-submit-idea-form"
              size="2"
              processing={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
            />
            <Error text={submitErrorMessage} marginTop="0px" />
          </MobileButton>
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(NewIdeaForm);
