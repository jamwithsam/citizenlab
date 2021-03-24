# frozen_string_literal: true

module GranularPermissions
  module Patches
    module InitiativeCommentPolicy
      def commenting_allowed?(user)
        !PermissionsService.new.denied?(user, 'commenting_initiative')
      end
    end
  end
end
