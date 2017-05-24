pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building containers'
        sh 'docker-compose build'
        sh 'docker-compose up -d postgres redis'
        sleep 10
        echo 'Setting up database'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm web bundle exec rake db:create'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm web bundle exec rake db:migrate'
      }
    }
    stage('Test') {
      steps {
        echo 'testing rspec'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm web bundle exec rake spec'
        sh 'docker-compose run --user "$(id -u):$(id -g)" --rm web bundle exec rake docs:generate'
        step([
            $class: 'RcovPublisher',
            reportDir: "coverage/rcov",
            targets: [
                [metric: "CODE_COVERAGE", healthy: 75, unhealthy: 50, unstable: 30]
            ]
        ])
        sh 'cp -r doc/api/* /var/www/apidocs'
      }
    }
    stage('Push docker image') {
      steps {
        echo 'Building containers'
        script {
          sh 'rm -rf public/uploads/*'
          docker.withRegistry("https://index.docker.io/v1/",'docker-hub-credentials') {
            def image = docker.build('citizenlabdotco/cl2-back:latest')
            image.push('latest')
          }
        }
      }
    }
    stage('Deploy to staging') {
      steps {
        sshagent (credentials: ['local-ssh-user']) {
          sh 'ssh -o StrictHostKeyChecking=no -l ubuntu 35.157.143.6 docker run --env-file cl2-deployment/.env-staging citizenlabdotco/cl2-back:latest rake db:migrate'
          sh 'ssh -o StrictHostKeyChecking=no -l ubuntu 35.157.143.6 "cd cl2-deployment && docker stack deploy --compose-file docker-compose-staging.yml cl2-back-stg --with-registry-auth"'
        }
      }
    }
  }
  post {
    always {
      junit 'spec/reports/**/*.xml'
      sh 'docker-compose down --volumes'
      cleanWs()
    }
    success {
      slackSend color: '#50c122', message: ":tada: SUCCESS: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nMore info at ${env.BUILD_URL}"
    }
    failure {
      slackSend color: '#e93b1c', message: ":boom: FAILURE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} failed\nSee what went wrong at ${env.BUILD_URL}"
    }
    unstable {
      slackSend color: '#d59a35', message: ":thinking_face: succeeded, but flagged UNSTABLE: ${env.JOB_NAME} build #${env.BUILD_NUMBER} passed all tests!\nThis probably means there were some warnings or pending tests.\nMore info at ${env.BUILD_URL}"
    }
  }
}
