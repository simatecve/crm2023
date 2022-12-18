class Integrations::Dyte::ProcessorService
  pattr_initialize [:account!, :conversation!]

  def create_a_meeting(agent)
    response = dyte_client.create_a_meeting("Meeting with #{agent.available_name}")

    return if response[:error].present?

    meeting = response['data']['meeting']
    @conversation.messages.create(
      {
        account_id: conversation.account_id,
        inbox_id: conversation.inbox_id,
        message_type: :outgoing,
        content_type: :integrations,
        content_attributes: {
          type: 'dyte',
          data: { meeting_id: meeting['id'] }
        },
        sender: agent
      }
    )
  end

  def add_participant_to_meeting(meeting_id, user)
    dyte_client.add_participant_to_meeting(meeting_id, user.id, user.name, user.avatar_url)
  end

  private

  def dyte_hook
    @dyte_hook ||= account.hooks.find_by!(app_id: 'dyte')
  end

  def dyte_client
    credentials = dyte_hook.settings
    @dyte_client ||= Dyte.new(credentials['api_key'], credentials['organization_id'])
  end
end
