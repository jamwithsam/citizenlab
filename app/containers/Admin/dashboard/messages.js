/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  // Index
  tabSummary: {
    id: 'app.containers.AdminPage.DashboardPage.tabSummary',
    defaultMessage: 'Summary',
  },
  tabUsers: {
    id: 'app.containers.AdminPage.DashboardPage.tabUsers',
    defaultMessage: 'Users',
  },
  tabAcquisition: {
    id: 'app.containers.AdminPage.DashboardPage.tabAcquisition',
    defaultMessage: 'Acquisition',
  },
  viewPublicResource: {
    id: 'app.containers.AdminPage.DashboardPage.viewPublicResource',
    defaultMessage: 'Dashboard',
  },
  helmetTitle: {
    id: 'app.containers.AdminPage.DashboardPage.helmetTitle',
    defaultMessage: 'Admin dashboard page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.DashboardPage.helmetDescription',
    defaultMessage: 'Dashboard for activities on the platform',
  },
  tryOutInsights: {
    id: 'app.containers.AdminPage.DashboardPage.tryOutInsights',
    defaultMessage: 'Try out {insightsLink}, our new beta feature',
  },
  insightsLinkText: {
    id: 'app.containers.AdminPage.DashboardPage.insightsLinkText',
    defaultMessage: 'insights',
  },
  // All tabs
  users: {
    id: 'app.containers.AdminPage.DashboardPage.users',
    defaultMessage: 'Users',
  },
  ideas: {
    id: 'app.containers.AdminPage.DashboardPage.ideas',
    defaultMessage: 'Ideas',
  },
  votes: {
    id: 'app.containers.AdminPage.DashboardPage.votes',
    defaultMessage: 'Votes',
  },
  comments: {
    id: 'app.containers.AdminPage.DashboardPage.comments',
    defaultMessage: 'Comments',
  },
  noData: {
    id: 'app.containers.AdminPage.DashboardPage.noData',
    defaultMessage: 'No data available with the current filters.',
  },
  // Time and Resolution Controls
  resolutionday: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionday',
    defaultMessage: 'in Days',
  },
  resolutionweek: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionweek',
    defaultMessage: 'in Weeks',
  },
  resolutionmonth: {
    id: 'app.containers.AdminPage.DashboardPage.resolutionmonth',
    defaultMessage: 'in Months',
  },
  customDateRange: {
    id: 'app.containers.AdminPage.DashboardPage.customDateRange',
    defaultMessage: 'Custom',
  },
  previous30Days: {
    id: 'app.containers.AdminPage.DashboardPage.previous30Days',
    defaultMessage: 'Previous 30 days',
  },
  previousWeek: {
    id: 'app.containers.AdminPage.DashboardPage.previousWeek',
    defaultMessage: 'Previous week',
  },
  previous90Days: {
    id: 'app.containers.AdminPage.DashboardPage.previous90Days',
    defaultMessage: 'Previous 90 days',
  },
  previousYear: {
    id: 'app.containers.AdminPage.DashboardPage.previousYear',
    defaultMessage: 'Previous year',
  },
  allTime: {
    id: 'app.containers.AdminPage.DashboardPage.allTime',
    defaultMessage: 'All Time',
  },
  // Summary Graphs
  usersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByTimeTitle',
    defaultMessage: 'Users',
  },
  activeUsers: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsers',
    defaultMessage: 'Active users',
  },
  activeUsersByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersByTimeTitle',
    defaultMessage: 'Active users',
  },
  activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.activeUsersDescription',
    defaultMessage: 'The number of users that either voted, commented or posted an idea on a given day.',
  },
  ideasByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.ideasByTimeTitle',
    defaultMessage: 'Ideas',
  },
  commentsByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.commentsByTimeTitle',
    defaultMessage: 'Comments',
  },
  votesByTimeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.votesByTimeTitle',
    defaultMessage: 'Votes',
  },
  numberOfVotesUp: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesUp',
    defaultMessage: 'Upvotes',
  },
  numberOfVotesDown: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesDown',
    defaultMessage: 'Downvotes',
  },
  numberOfVotesTotal: {
    id: 'app.containers.AdminPage.DashboardPage.numberOfVotesTotal',
    defaultMessage: 'Total votes',
  },
  participationPerProject: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerProject',
    defaultMessage: 'Participation per project',
  },
  selectedProject: {
    id: 'app.containers.AdminPage.DashboardPage.selectedProject',
    defaultMessage: 'current project filter',
  },
  participationPerTopic: {
    id: 'app.containers.AdminPage.DashboardPage.participationPerTopic',
    defaultMessage: 'Participation per topic',
  },
  selectedTopic: {
    id: 'app.containers.AdminPage.DashboardPage.selectedTopic',
    defaultMessage: 'current topic filter',
  },
  totalCount: {
    id: 'app.containers.AdminPage.DashboardPage.totalCount',
    defaultMessage: '{selectedResourceName} total in {selectedName} : {selectedCount}',
  },
  resourceByDifference: {
    id: 'app.containers.AdminPage.DashboardPage.resourceByDifference',
    defaultMessage: '{selectedResourceName} difference with {selectedName}',
  },
  // Users Charts
  usersByAgeTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByAgeTitle',
    defaultMessage: 'Users by age',
  },
  usersByDomicileTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByDomicileTitle',
    defaultMessage: 'Users by domicile',
  },
  usersByGenderTitle: {
    id: 'app.containers.AdminPage.DashboardPage.usersByGenderTitle',
    defaultMessage: 'Users by gender',
  },
  male: {
    id: 'app.containers.AdminPage.DashboardPage.male',
    defaultMessage: 'male',
  },
  female: {
    id: 'app.containers.AdminPage.DashboardPage.female',
    defaultMessage: 'female',
  },
  unspecified: {
    id: 'app.containers.AdminPage.DashboardPage.unspecified',
    defaultMessage: 'unspecified',
  },
  _blank: {
    id: 'app.containers.AdminPage.DashboardPage._blank',
    defaultMessage: 'unknown',
  },
  top10activeUsersDescription: {
    id: 'app.containers.AdminPage.DashboardPage.top10activeUsersDescription',
    defaultMessage: 'To be determined.',
  },
  mostActiveUsers: {
    id: 'app.containers.AdminPage.DashboardPage.mostActiveUsers',
    defaultMessage: 'Most active users',
  },
  userActivityScore: {
    id: 'app.containers.AdminPage.DashboardPage.userActivityScore',
    defaultMessage: 'User activity score',
  },
  //OLD MESSAGES
  projectFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.projectFilterLabel',
    defaultMessage: 'Projects',
  },
  groupFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.groupFilterLabel',
    defaultMessage: 'Groups',
  },
  topicFilterLabel: {
    id: 'app.containers.AdminPage.DashboardPage.topicFilterLabel',
    defaultMessage: 'Topics',
  },
});
