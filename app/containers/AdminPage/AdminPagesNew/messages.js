/*
 * AdminPages Messages
 *
 * This contains all the text for the AdminPages component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.AdminPages.AdminPagesNew.header',
    defaultMessage: 'Create new page',
  },
  publish: {
    id: 'app.containers.AdminPages.AdminPagesNew.publish',
    defaultMessage: 'Publish page',
  },
  publishing: {
    id: 'app.containers.AdminPages.AdminPagesNew.publishing',
    defaultMessage: 'Publishing...',
  },
  publishError: {
    id: 'app.containers.AdminPages.AdminPagesNew.publishError',
    defaultMessage: 'Could not publish the page. Error: {publishError}',
  },
  invalidFormError: {
    id: 'app.containers.AdminPages.AdminPagesNew.invalidFormError',
    defaultMessage: 'Title and content cannot be empty',
  },
  published: {
    id: 'app.containers.AdminPages.AdminPagesNew.published',
    defaultMessage: 'Page published!',
  },
  titlePlaceholder: {
    id: 'app.containers.AdminPages.AdminPagesNew.titlePlaceholder',
    defaultMessage: 'Page title...',
  },
});
