require "rails_helper"

describe EmailCampaigns::DeliveryService do
  let(:service) { EmailCampaigns::DeliveryService.new }

  describe "campaign_types" do
    it "returns all campaign types" do
      expect(service.campaign_types).to_not be_empty
    end

    it "returns campaign_types that all have at least 1 campaign_type_description and admin_campaign_type_description translation defined" do
      multiloc_service = MultilocService.new
      service.campaign_types.each do |campaign_type|
        expect{multiloc_service.i18n_to_multiloc("email_campaigns.campaign_type_description.#{campaign_type.constantize.campaign_name}")}
          .to_not raise_error
        expect{multiloc_service.i18n_to_multiloc("email_campaigns.admin_campaign_type_description.#{campaign_type.constantize.campaign_name}")}
          .to_not raise_error
      end
    end

    it "returns campaign_types that are all instantiatable without extra arguments, except for Manual campaign" do
      (service.campaign_types - ['EmailCampaigns::Campaigns::Manual']).each do |campaign_type|
        expect{campaign_type.constantize.create!}.to_not raise_error
      end
    end
  end

  describe "send_on_schedule" do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }

    it "enqueues an internal delivery job" do
      travel_to campaign.ic_schedule.start_time do
        expect{service.send_on_schedule(Time.now)}
          .to have_enqueued_job(ActionMailer::MailDeliveryJob)
          .exactly(1).times
      end
    end

    it "does not send any email commands through Segment" do
      travel_to campaign.ic_schedule.start_time do
        expect{service.send_on_schedule(Time.now)}
          .not_to have_enqueued_job(PublishRawEventToSegmentJob)
      end
    end

    it "creates deliveries for a trackable campaign" do
      travel_to campaign.ic_schedule.start_time do
        service.send_on_schedule(Time.now)
        expect(campaign.deliveries.first).to have_attributes({
          campaign_id: campaign.id,
          user_id: admin.id,
          delivery_status: 'sent'
        })
      end
    end
  end

  describe "send_on_activity" do
    let!(:campaign) { create(:comment_on_your_comment_campaign) }
    let(:notification) { create(:comment_on_your_comment) }
    let(:activity) {
      Activity.create(
        item: notification,
        item_type: notification.class.name,
        action: 'created',
        acted_at: Time.now
      )
    }
    let(:user) { create(:user) }

    it "enqueues an external event job" do
      expect{service.send_on_activity(activity)}
        .to have_enqueued_job(PublishRawEventToRabbitJob)
        .exactly(1).times
    end

    it "does not send any email commands through Segment" do
      expect{service.send_on_activity(activity)}
        .not_to have_enqueued_job(PublishRawEventToSegmentJob)
    end

    context "on project_phase_upcoming notification" do
      let!(:campaign) { create(:project_phase_upcoming_campaign) }
      let(:notification) { create(:project_phase_upcoming) }
      let(:activity) {
        Activity.create(
          item: notification,
          item_type: notification.class.name,
          action: 'created',
          acted_at: Time.now
        )
      }
      let!(:admin) { create(:admin) }

      it "delays enqueueing a job because the command specifies a delay" do
        travel_to Time.now do
          expect{service.send_on_activity(activity)}
            .to have_enqueued_job(PublishRawEventToRabbitJob)
            .exactly(1).times
            .at(Time.now + 8.hours)
        end
      end
    end
  end

  describe "send_now" do
    let!(:campaign) { create(:manual_campaign) }
    let!(:users) { create_list(:user, 3) }

    it "launches deliver_later on an ActionMailer" do
      message_delivery = instance_double(ActionMailer::MessageDelivery)
      expect(EmailCampaigns::CampaignMailer.with(campaign: campaign, command: anything))
        .to receive(:campaign_mail)
        .and_return(message_delivery)
        .exactly(User.count).times
      expect(message_delivery)
        .to receive(:deliver_later)
        .exactly(User.count).times

      service.send_now(campaign)
    end

    it "creates deliveries for a Trackable campaign" do
      service.send_now(campaign)
      expect(EmailCampaigns::Delivery.count).to eq User.count
    end
  end

  describe "consentable_campaign_types_for" do
    it "returns all campaign types that return true to #consentable_for?, for the given user and have an enabled campaign" do
      class NonConsentableCampaign < EmailCampaigns::Campaign
      end
      class ConsentableCampaign < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable

        def self.consentable_roles
          []
        end
      end
      class ConsentableDisableableCampaignA < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable
        include EmailCampaigns::Disableable

        def self.consentable_roles
          []
        end
      end
      class ConsentableDisableableCampaignB < EmailCampaigns::Campaign
        include EmailCampaigns::Consentable
        include EmailCampaigns::Disableable

        def self.consentable_roles
          []
        end
      end
      NonConsentableCampaign.create!
      ConsentableCampaign.create!
      ConsentableDisableableCampaignA.create!(enabled: false)
      ConsentableDisableableCampaignB.create!(enabled: false)
      ConsentableDisableableCampaignB.create!(enabled: true)
      stub_const(
        "EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES",
        [NonConsentableCampaign, ConsentableDisableableCampaignA, ConsentableDisableableCampaignB, ConsentableCampaign]
      )
      user = create(:user)

      expect(service.consentable_campaign_types_for(user)).to match_array ["ConsentableCampaign", "ConsentableDisableableCampaignB"]
    end
  end

end
