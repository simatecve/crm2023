class Api::V1::Accounts::Integrations::DyteController < Api::V1::Accounts::BaseController
  before_action :fetch_conversation, only: [:create_a_meeting]
  before_action :fetch_message, only: [:add_participant_to_meeting]

  def create_a_meeting
    dyte_processor_service.create_a_meeting(Current.user)
    head :ok
  end

  def add_participant_to_meeting
    dyte_processor_service.create_a_meeting(Current.user)
  end

  private

  def dyte_processor_service
    Integrations::Dyte::ProcessorService.new(account: Current.account, conversation: @conversation)
  end

  def permitted_params
    params.permit(:conversation_id, :meeting_id)
  end

  def fetch_conversation
    @conversation = Current.account.conversations.find_by(display_id: permitted_params[:conversation_id])
  end
end
