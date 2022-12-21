class Api::V1::Accounts::Integrations::DyteController < Api::V1::Accounts::BaseController
  before_action :fetch_conversation, only: [:create_a_meeting]
  before_action :fetch_message, only: [:add_participant_to_meeting]

  def create_a_meeting
    dyte_processor_service.create_a_meeting(Current.user)
    head :ok
  end

  def add_participant_to_meeting
    return render json: { error: 'Invalid Data' }, status: :unprocessable_entity if @message.content_type == 'integations'

    response= dyte_processor_service.add_participant_to_meeting(@message.content_attributes['data']['meeting_id'], Current.user)
    render json: response
  end

  private

  def dyte_processor_service
    Integrations::Dyte::ProcessorService.new(account: Current.account, conversation: @conversation)
  end

  def permitted_params
    params.permit(:conversation_id, :message_id)
  end

  def fetch_conversation
    @conversation = Current.account.conversations.find_by!(display_id: permitted_params[:conversation_id])
  end

  def fetch_message
    @message = Current.account.messages.find(permitted_params[:message_id])
    @conversation = @message.conversation
  end
end
