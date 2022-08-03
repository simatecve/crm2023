class ActionCableBroadcastJob < ApplicationJob
  queue_as :default

  def perform(members, event_name, data)
    logger.info "Processing ActionCableBroadcastJob"
    logger.info "Available Channels: #{Redis.new.pubsub("channels", "*action_cable:*")}"
    members.each do |member|
      logger.info "Broadcasting to member: #{member}"
      result = ActionCable.server.broadcast(member, { event: event_name, data: data })
      logger.info "Broadcast result: #{result}"
    end
  end
end
