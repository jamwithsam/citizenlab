module SmartGroups
  class RulesService
    include Rulable

    add_rules SmartGroups::Rules::CustomFieldText,
              SmartGroups::Rules::CustomFieldSelect,
              SmartGroups::Rules::CustomFieldCheckbox,
              SmartGroups::Rules::CustomFieldDate,
              SmartGroups::Rules::CustomFieldNumber,
              SmartGroups::Rules::Role,
              SmartGroups::Rules::Email,
              SmartGroups::Rules::LivesIn,
              SmartGroups::Rules::RegistrationCompletedAt,
              SmartGroups::Rules::ParticipatedInProject,
              SmartGroups::Rules::ParticipatedInTopic,
              SmartGroups::Rules::ParticipatedInIdeaStatus

    JSON_SCHEMA_SKELETON = {
      'description' => 'Schema for validating the rules used in smart groups',
      'type' => 'array',
      'items' => {
        'anyOf' => []
      },
      'definitions' => {
        'uuid' => {
          'type' => 'string',
          'pattern' => '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
        },
        'customFieldId' => {
          'description' => 'The ID of a custom field',
          '$ref' => '#/definitions/uuid'
        },
        'customFieldOptionId' => {
          'description' => 'The ID of a custom field option',
          '$ref' => '#/definitions/uuid'
        }
      }
    }.freeze

    # This method is very carefully written to do it all in
    # 2 queries, so beware when editing
    def groups_for_user(user)
      # We're using `id: [user.id]` instead of `id: user.id` to
      # workaround this rails/arel issue:
      # https://github.com/rails/rails/issues/20077
      user_relation_object = ::User.where(id: [user.id])
      groups_in_common_for_users(user_relation_object)
    end

    def groups_in_common_for_users(users)
      ::Group.rules.select { |group| users_belong_to_group?(users, group) }.inject(:or) ||
        ::Group.none
    end

    def users_belong_to_group?(group, users)
      ::Group.where(id: group.id)
             .where(filter(users, group.rules).arel.exists)
    end

    def filter(users_scope, group_json_rules)
      parse_json_rules(group_json_rules)
        .inject(users_scope) { |memo, rule| rule.filter(memo) }
    end

    def generate_rules_json_schema
      JSON_SCHEMA_SKELETON.dup.merge('items' => { 'anyOf' => rules_by_type_to_json_schema })
    end

    def parse_json_rules(json_rules)
      json_rules.map { |json_rule| parse_json_rule(json_rule) }
    end

    def parse_json_rule(json_rule)
      rule_class = rule_type_to_class(json_rule['ruleType'])
      rule_class.from_json(json_rule)
    end

    def filter_by_rule_type(groups_scope, rule_type)
      groups_scope.rules
                  .where("rules @> '[{\"ruleType\": \"#{rule_type}\"}]'")
    end

    def filter_by_rule_value(groups_scope, rule_value)
      groups_scope.rules
                  .where("rules @> '[{\"value\": \"#{rule_value}\"}]'")
    end

    private

    def rules_by_type_to_json_schema
      each_rule.flat_map(&:to_json_schema)
    end

    module Rulable
      def self.included(base)
        base.class_eval do
          class<< self
            def rules
              @rules ||= []
            end

            def add_rules(*rule_classes)
              rules.push(rule_classes)
            end

            def rules_by_type
              rules.index_by(&:rule_type)
            end

            def each_rule
              rules_by_type.values.each
            end

            def rule_by_type(rule_type)
              rules_by_type[rule_type]
            end
          end

          delegate :rules_by_type, :rules, :each_rule, :rule_by_type, to: :class
        end
      end
    end
  end
end
