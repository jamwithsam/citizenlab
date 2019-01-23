require "rails_helper"

def call_pcc pc_id, service, from, to
  service.participation_context_changed(
    pc_id,
    from.participation_method,
    to.participation_method,
    from.survey_service,
    to.survey_service,
    from.survey_embed_url,
    to.survey_embed_url
  )
end

describe Surveys::TypeformWebhookManager do
  let(:tf_api) { instance_double(Surveys::Typeform::Api) }
  let(:service) { Surveys::TypeformWebhookManager.new(tf_api) }

  describe "participation_context_changed" do
    let(:from) { build(:continuous_survey_project) }
    let(:to) { build(:continuous_survey_project) }


    it "doesn't call tf api when no pc is survey related" do
      from = build(:continuous_project)
      to = build(:continuous_project)
      call_pcc(to.id, service, from, to)
    end

    it "doesn't call tf api when no pc is typeform related" do
      from = build(:continuous_google_survey_project)
      to = build(:continuous_google_survey_project, survey_embed_url: "https://docs.google.com/forms/d/e/changedfake/viewform?embedded=true")
      call_pcc(to.id, service, from, to)
    end

    it "creates a webhook when the participation_method goes from ideation to survey" do
      from = build(:continuous_project)
      to = build(:continuous_survey_project)
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to.id, service, from, to)
    end

    it "deletes a webhook when the participation_method goes from survey to information" do
      from = build(:continuous_survey_project)
      to = build(:continuous_project)
      expect(tf_api).to receive(:delete_webhook)
      call_pcc(to.id, service, from, to)
    end

    it "creates a webhook when the survey_service goes from google_forms to typeform" do
      from = build(:continuous_google_survey_project)
      to = build(:continuous_survey_project)
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to.id, service, from, to)
    end

    it "deletes a webhook when the survey_service goes from typeform to google_forms" do
      from = build(:continuous_survey_project)
      to = build(:continuous_google_survey_project)
      expect(tf_api).to receive(:delete_webhook)
      call_pcc(to.id, service, from, to)
    end

    it "updates a webhook when the survey_embed_url changes" do
      from = build(:continuous_survey_project)
      to = build(:continuous_survey_project, survey_embed_url: 'https://citizenlabco.typeform.com/to/Lr57Iz')
      expect(tf_api).to receive(:create_or_update_webhook)
      call_pcc(to.id, service, from, to)
    end

  end

  describe "participation_context_created" do
    it "doesn't create a webhook when it's not typeform" do
      pc = create(:continuous_google_survey_project)
      service.participation_context_created(pc.id, pc.participation_method, pc.survey_service, pc.survey_embed_url)
    end
    it "creates a webhook when it's typeform" do
      pc = create(:continuous_survey_project)
      expect(tf_api).to receive(:create_or_update_webhook)
      service.participation_context_created(pc.id, pc.participation_method, pc.survey_service, pc.survey_embed_url)
    end
  end

  describe "participation_context_to_be_deleted" do
    it "doesn't delete a webhook when it's not typeform" do
      pc = create(:continuous_google_survey_project)
      service.participation_context_to_be_deleted(pc.id, pc.participation_method, pc.survey_service, pc.survey_embed_url)
    end
    it "deletes a webhook when it's typeform" do
      pc = create(:continuous_survey_project)
      expect(tf_api).to receive(:delete_webhook)
      service.participation_context_to_be_deleted(pc.id, pc.participation_method, pc.survey_service, pc.survey_embed_url)
    end
  end

  describe "tenant_to_be_destroyed" do
    it "deletes all typeform survey webhooks" do
      create(:project_with_phases)
      create_list(:continuous_survey_project, 2)
      create(:phase, participation_method: 'survey', survey_service: 'typeform', survey_embed_url: 'https://citizenlabco.typeform.com/to/Lr57Iz')
      expect(tf_api).to receive(:delete_webhook).exactly(3).times
      service.tenant_to_be_destroyed(Tenant.current)
    end
  end

end
