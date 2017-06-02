const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  path: '/projects/:projectId/ideas',
  name: 'ideas 4 projects page',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('containers/Projects/show/ideas'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([component]) => {
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
});
