source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

gem 'rbtrace'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.0.3.1'
# Use postgresql as the database for Active Record
gem 'pg' # , '~> 0.18'
# Use Puma as the app server
gem 'puma' # , '~> 3.7'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Use Rack CORS for handling Cross-Origin Resource Sharing (CORS), making cross-origin AJAX possible
gem 'rack-cors'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: %i[mri mingw x64_mingw]
  gem 'database_cleaner'
  gem 'factory_bot_rails'
  gem 'license_finder'
  gem 'rack-mini-profiler'
  gem 'rspec_api_documentation'
  gem 'rspec_junit_formatter'
  gem 'rspec-rails'
  gem 'rubocop-ast', '~> 0.7.1', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'simplecov'
  gem 'simplecov-rcov'
  gem "test-prof", "~> 1.0"
end

group :development do
  gem 'bullet'
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'pry'
  gem 'pry-stack_explorer'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'redcarpet'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  gem 'rubyXL'
  gem 'shoulda-matchers', '~> 3.1'
  gem 'webmock', '~> 3.4'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
# gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Latest version (2.4.1) of Pundit on RubyGems is quite outdated (2019-08-14).
# This newer version from Git adds reason to Pundit::NotAuthorized.
gem "pundit", git: 'https://github.com/varvet/pundit', branch: 'master', ref: '973b63b396c2a98099caf5eefd1c6841416eddfa'
gem "active_model_serializers", "~> 0.10.8"

# See https://github.com/nsarno/knock/issues/250
# Installs v2.2 which is not available on rubygems.org
gem 'knock', git: 'https://github.com/nsarno/knock', branch: 'master', ref: '9214cd027422df8dc31eb67c60032fbbf8fc100b'
gem 'que', git: 'https://github.com/que-rb/que', branch: 'master', ref: '77c6b92952b821898c393239ce0e4047b17d7dae'
gem 'que-web'

gem 'activerecord-import', '~> 1.0'
gem 'activerecord_json_validator', '~> 1.3.0'
gem 'activerecord-postgis-adapter', '~> 6.0.0'

# This branch must be used because the latest version (2.1.1)
# requires activerecord < 6.0, while activerecord = 6.0.1 is
# required by Rails 6.0.1.
gem 'apartment', github: 'influitive/apartment', branch: 'development'
gem 'api-pagination', '~> 4.8.2'
gem 'carrierwave', '~> 2.0.2'
gem 'carrierwave-base64', '~> 2.6'
gem 'kaminari', '~> 1.2'

gem 'rails-i18n', '~> 6.0.0'

gem 'awesome_nested_set', '~> 3.2.0'
gem 'axlsx', '3.0.0.pre'
gem 'counter_culture', '~> 2.1'
gem 'fog-aws'
gem 'groupdate' # , "~> 3.2.0"
gem 'liquid', '~> 4.0'
gem 'mini_magick', '~> 4.9'
gem 'pg_search', '~> 2.1.2'
gem 'premailer-rails', '~> 1.10.3'
gem 'rest-client'
gem 'rgeo-geojson'
gem 'rubyzip', '~> 1.3.0'

gem 'okcomputer'
gem 'omniauth' # , '~> 1.7.1'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-twitter'
gem 'sentry-raven'
gem 'simple_segment', '~>1.2'
# This fork was made to update the version of jws which is
# required for the google omniauth gem.
gem 'omniauth-azure-activedirectory', github: 'CitizenLabDotCo/omniauth-azure-activedirectory'
gem 'omniauth_openid_connect', '~> 0.3.3'
# Forked to support a userinfo response in JWT form
# Can go back to vanilla when this PR is merged and released:
# https://github.com/nov/openid_connect/pull/48
gem 'acts_as_list'
gem 'bunny', '>= 2.7.2'
gem 'faker'
gem 'openid_connect', github: 'CitizenLabDotCo/openid_connect'
gem 'scenic'

# This fork was made to support the latest verions of Ruby
# and Rails.
gem 'ice_cube', github: 'CitizenLabDotCo/ice_cube'
# Also required here to be able to initialize Mailgun in
# e.g. production.rb, which would otherwise result in an
# "undefined method 'mailgun_settings=' for ActionMailer::Base:Class"
# exception.
gem 'aws-sdk-s3', '~> 1'
gem 'bootsnap', require: false
gem 'dalli'
gem 'mailgun-ruby', '~>1.2.0'
gem 'rails_semantic_logger'
gem 'rinku', '~> 2'
# For serialization of heterogeneous collections (i.e. notifications), see
# https://github.com/Netflix/fast_jsonapi/pull/410.
gem 'fast_jsonapi', github: 'dvandersluis/fast_jsonapi', branch: 'heterogeneous-collection'
gem 'rack-attack', '~> 6'

# mjml-rails cannot find the MJML parser when installed
# through the emails engine and is therefore specified
# in the main app.
gem 'intercom', '~> 4.1'
gem 'mjml-rails', '~> 4.4'

gem 'admin_api', path: 'engines/admin_api'
gem 'custom_maps', path: 'engines/custom_maps'
gem 'custom_statuses', path: 'engines/custom_statuses'
gem 'custom_style', path: 'engines/custom_style'
gem 'email_campaigns', path: 'engines/email_campaigns'
gem 'frontend', path: 'engines/frontend'
gem 'geographic_dashboard', path: 'engines/geographic_dashboard'
gem 'granular_permissions', path: 'engines/granular_permissions'
gem 'idea_custom_fields', path: 'engines/idea_custom_fields'
gem 'id_bogus', path: 'engines/id_bogus'
gem 'id_bosa_fas', path: 'engines/id_bosa_fas'
gem 'id_clave_unica', path: 'engines/id_clave_unica'
gem 'id_cow', path: 'engines/id_cow'
gem 'id_franceconnect', path: 'engines/id_franceconnect'
gem 'id_id_card_lookup', path: 'engines/id_id_card_lookup'
gem 'machine_translations', path: 'engines/machine_translations'
gem 'matomo', path: 'engines/matomo'
gem 'multi_tenancy', path: 'engines/multi_tenancy'
gem 'nlp', path: 'engines/nlp'
gem 'onboarding', path: 'engines/onboarding'
gem 'polls', path: 'engines/polls'
gem 'project_folders', path: 'engines/project_folders'
gem 'project_permissions', path: 'engines/project_permissions'
gem 'public_api', path: 'engines/public_api'
gem 'seo', path: 'engines/seo'
gem 'surveys', path: 'engines/surveys'
gem 'tagging', path: 'engines/tagging'
gem 'verification', path: 'engines/verification'
gem 'volunteering', path: 'engines/volunteering'

gem 'citizen_lab', path: 'plugins/citizen_lab'
