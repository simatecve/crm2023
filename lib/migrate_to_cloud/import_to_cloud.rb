class MigrateToCloud::ImportToCloud
  pattr_initialize [:account_id!, :inbox_id, :password]

  def perform(type)
    case type
    when 'user'
      prepare_user_map
      # import_users_to_account
    when 'contact'
      import_contacts_to_account
    when 'conversation'
      import_conversations_to_account
    when 'message'
      import_messages_to_account
    when 'all'
      import_users_to_account
      import_contacts_to_account
      import_conversations_to_account
      import_messages_to_account
    end
  end

  private

  def import_users_to_account
    filename = 'export/users.csv'
    data = []
    CSV.foreach(filename, headers: true) do |row|
      user = row.to_hash
      new_user = {}
      new_user['created_at'] = user['created_at']
      new_user['custom_attributes'] = user['custom_attributes']
      new_user['display_name'] = user['display_name']
      new_user['email'] = user['email']
      new_user['name'] = user['name']
      new_user['password'] = password
      new_user['updated_at'] = user['updated_at']
      new_user['confirmed_at'] = Time.now
      new_user['custom_attributes'] = append_migrated_id(new_user['custom_attributes'], user['id'])
      user = User.create!(new_user)
      account.account_users.create(
        user_id: user.id,
        role: :agent
      )
      data.push(new_user)
    end
    log_to_console('INSERT_USER', data.last['custom_attributes'][:migrated_id])
  end

  def import_contacts_to_account
    filename = 'export/contacts.csv'
    iterator = 1
    data = []
    CSV.foreach(filename, headers: true) do |row|
      if iterator > 1000
        iterator = 1
        account.contacts.insert_all(data)
        log_to_console('INSERT_CONTACT', data.last['additional_attributes'][:migrated_id])
        data = []
      end

      contact = row.to_hash

      new_contact = {}
      new_contact['additional_attributes'] = contact['additional_attributes']
      new_contact['custom_attributes'] = contact['custom_attributes']
      new_contact['email'] = contact['email']
      new_contact['identifier'] = contact['identifier']
      new_contact['last_activity_at'] = contact['last_activity_at']
      new_contact['name'] = contact['name']
      new_contact['phone_number'] = contact['phone_number']
      new_contact['created_at'] = contact['created_at']
      new_contact['updated_at'] = contact['updated_at']

      new_contact['additional_attributes'] = append_migrated_id(new_contact['additional_attributes'], contact['id'])
      new_contact['custom_attributes'] = preprare_json(new_contact['custom_attributes'])

      data.push(new_contact)
      iterator += 1
    end
    account.contacts.insert_all(data)
  end

  def import_conversations_to_account
    filename = 'export/conversations.csv'
    iterator = 1
    data = []
    contact_map = prepare_contact_map
    user_map = prepare_user_map

    CSV.foreach(filename, headers: true) do |row|
      if iterator > 100
        iterator = 1
        account.conversations.insert_all(data)
        log_to_console('INSERT_CONVERSATIONS', data.last['additional_attributes'][:migrated_id])
        data = []
      end
      conversation = row.to_hash
      new_conversation = {}
      contact_id = contact_map[conversation['contact_id']]
      user_id = user_map[conversation['assignee_id']]
      return if contact_id.blank?

      contact_inbox = ContactInbox.create!(contact_id: contact_id, inbox_id: inbox_id, source_id: SecureRandom.uuid)

      new_conversation['additional_attributes'] = conversation['additional_attributes']
      new_conversation['agent_last_seen_at'] = conversation['agent_last_seen_at']
      new_conversation['assignee_last_seen_at'] = conversation['assignee_last_seen_at']
      new_conversation['contact_last_seen_at'] = conversation['contact_last_seen_at']
      new_conversation['custom_attributes'] = conversation['custom_attributes']
      new_conversation['first_reply_created_at'] = conversation['first_reply_created_at']
      new_conversation['identifier'] = conversation['identifier']
      new_conversation['last_activity_at'] = conversation['last_activity_at']
      new_conversation['snoozed_until'] = conversation['snoozed_until']
      new_conversation['status'] = conversation['status']
      new_conversation['uuid'] = SecureRandom.uuid
      new_conversation['created_at'] = conversation['created_at']
      new_conversation['updated_at'] = conversation['updated_at']
      new_conversation['account_id'] = conversation['account_id']
      new_conversation['assignee_id'] = user_id
      new_conversation['campaign_id'] = nil
      new_conversation['contact_id'] = contact_id
      new_conversation['inbox_id'] = inbox_id
      new_conversation['team_id'] = nil

      new_conversation['additional_attributes'] = append_migrated_id(new_conversation['additional_attributes'], conversation['id'])
      new_conversation['custom_attributes'] = preprare_json(new_conversation['custom_attributes'])
      data.push(new_conversation)
      iterator += 1
    end
    account.conversations.insert_all(data)
  end

  def import_messages_to_account
    contact_map = prepare_contact_map
    conversation_map = prepare_conversation_map
    user_map = prepare_user_map

    filename = 'export/messages.csv'
    iterator = 1
    data = []
    CSV.foreach(filename, headers: true) do |row|
      if iterator > 1000
        iterator = 1
        account.messages.insert_all(data)
        log_to_console('INSERT_MESSAGES', data.last['additional_attributes'][:migrated_id])
        data = []
      end
      message = row.to_hash
      # log_to_console('PREPARING_MESSAGE', message["id"])
      conversation_id = conversation_map[message['conversation_id']]

      next if conversation_id.blank?

      new_message = {}
      new_message['content'] = message['content']
      new_message['content_attributes'] = message['content_attributes']
      new_message['content_type'] = message['content_type']
      new_message['external_source_ids'] = message['external_source_ids']
      new_message['message_type'] = message['message_type']
      new_message['private'] = message['private']
      new_message['sender_type'] = message['sender_type']
      new_message['status'] = message['status']
      new_message['created_at'] = message['created_at']
      new_message['updated_at'] = message['updated_at']
      new_message['inbox_id'] = inbox_id
      new_message['source_id'] = message['source_id']
      new_message['conversation_id'] = conversation_id

      sender_id = nil
      if new_message['sender_type'] == 'Contact' && contact_map[message['sender_id']]
        sender_id = contact_map[message['sender_id']]
      elsif new_message['sender_type'] == 'User' && user_map[message['sender_id']]
        sender_id = user_map[message['sender_id']]
      end

      new_message['sender_id'] = sender_id
      new_message['additional_attributes'] = append_migrated_id(new_message['additional_attributes'], message['id'])
      new_message['content_attributes'] = preprare_json(new_message['content_attributes'])
      new_message['external_source_ids'] = preprare_json(new_message['external_source_ids'])

      data.push(new_message)
      iterator += 1
    end
    account.messages.insert_all(data)
  end

  def preprare_json(content)
    if content
      JSON.parse(content)
    else
      {}
    end
  end

  def append_migrated_id(content, migrated_id)
    if content
      additional_attributes = JSON.parse(content)
      additional_attributes.merge({ migrated_id: migrated_id })
    else
      { migrated_id: migrated_id }
    end
  end

  def log_to_console(type, id)
    print "#{Time.now} [#{type}]: #{id}\n"
  end

  def prepare_contact_map
    contact_map = {}
    account.contacts.find_in_batches do |contact_batch|
      contact_batch.each do |contact|
        contact_map[contact.additional_attributes['migrated_id']] = contact.id
      end
    end
    log_to_console('PREPARE_CONTACT_MAP', '')
    contact_map
  end

  def prepare_user_map
    user_map = {}
    account.users.find_in_batches do |user_batch|
      user_batch.each do |user|
        user_map[user.custom_attributes['migrated_id']] = user.id
      end
    end
    log_to_console('PREPARE_USER_MAP', user_map)
    user_map
  end

  def prepare_conversation_map
    conversation_map = {}
    account.conversations.find_in_batches do |conversation_batch|
      conversation_batch.each do |conversation|
        conversation_map[conversation.additional_attributes['migrated_id']] = conversation.id
      end
    end
    log_to_console('PREPARE_CONVERSATION_MAP', '')
    conversation_map
  end

  def account
    @account ||= Account.find(account_id)
  end
end
