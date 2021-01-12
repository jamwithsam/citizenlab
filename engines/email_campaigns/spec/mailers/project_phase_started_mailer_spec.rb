require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPhaseStartedMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::ProjectPhaseStarted.create! }
    let!(:project) { create(:project) }
    let!(:phase) { project.phase }
    let!(:notification) { create(:project_phase_started, recipient: recipient, project: project, phase: phase) }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: notification.phase.title_multiloc,
          phase_description_multiloc: notification.phase.description_multiloc,
          phase_start_at: notification.phase.start_at.iso8601,
          phase_end_at: notification.phase.end_at.iso8601,
          phase_url: Frontend::UrlService.new.model_to_url(notification.phase, locale: recipient.locale),
          project_title_multiloc: notification.project.title_multiloc,
          project_description_multiloc: notification.project.description_multiloc
        },
        delay: 8.hours.to_i
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:mail_document) { Nokogiri::HTML.fragment(mail.body.encoded) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('An idea you commented on has received an official update')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(Tenant.current.settings.dig('core', 'organization_name', 'en'))
    end

    it 'assigns home url' do
      expect(mail.body.encoded)
        .to match(Frontend::UrlService.new.home_url(tenant: Tenant.current, locale: 'en'))
    end
  end
end
