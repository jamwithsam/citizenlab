module Surveys

  class TypeformWebhookManager

    def initialize(tf_api = nil)
      @tf_api = tf_api || Typeform::Api.new(Tenant.settings('typeform_surveys', 'user_token'))
      @secret = ENV.fetch("SECRET_TOKEN_TYPEFORM") # used to verify that requests are coming from Typeform.
    end

    # Gets called every time the participation context changed wrt
    # participation_method or survey_embed_url
    #
    # @param [ParticipationContext] pc
    # @param [String] pm_from previous participation method
    # @param [String] pm_to new participation method
    # @param [String] service_from previous external survey service
    # @param [String] service_to new external survey service
    # @param [String] url_from previous form url
    # @param [String] url_to new form url
    def participation_context_changed(pc, pm_from, pm_to, service_from, service_to, url_from, url_to)
      return save_webhook(url_to, pc) if pm_to == 'survey' && service_to == 'typeform' && url_to
      return delete_webhook(url_from, pc.id) if pm_from == 'survey' && service_from == 'typeform'
    end

    def participation_context_created(pc, pm, service, url)
      save_webhook(url, pc) if pm == 'survey' && service == 'typeform' && url
    end

    def participation_context_to_be_deleted(pc_id, pm, service, url)
      delete_webhook(url, pc_id) if pm == 'survey' && service == 'typeform' && url
    end

    def tenant_to_be_destroyed(tenant)
      [Project.is_participation_context, Phase].each do |klass|
        klass.where(participation_method: 'survey', survey_service: 'typeform')
             .each { |pc| delete_webhook(pc.survey_embed_url, pc.id) }
      end
    end

    private

    # Creates or deletes a Typeform webhook
    def save_webhook(form_url, participation_context)
      @tf_api.create_or_update_webhook(
          form_id: embed_url_to_form_id(form_url),
          tag: participation_context.id,
          url: tenant_to_webhook_url(Tenant.current, participation_context),
          secret: @secret
      )
    end

    def delete_webhook(form_url, webhook_id)
      @tf_api.delete_webhook(
          form_id: embed_url_to_form_id(form_url),
          tag: webhook_id,
      )
    end

    # Extracts the form_id from the Typeform form url.
    def embed_url_to_form_id(embed_url)
      embed_url.split('/').last
    end

    def tenant_to_webhook_url(tenant, pc)
      url_params = {
          tenant_id: tenant.id,
          pc_id: pc.id,
          pc_type: pc.class.name
      }
      "http://#{ENV.fetch('CLUSTER_HOST')}/hooks/typeform_events?#{url_params.to_query}"
    end

    # @param [ParticipationContext] participation_context
    # @param [Tenant] tenant
    def webhook_url(participation_context, tenant = nil)
      tenant ||= Tenant.current
      url_params = {pc_id: participation_context.id, pc_type: participation_context.class.name}
      "https://#{tenant.host}/hooks/typeform_events?#{url_params.to_query}" # MT_TODO use the base_backend_uri
    end
  end
end