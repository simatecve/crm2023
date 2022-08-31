class Notification::EmailNotificationJob < ApplicationJob
  queue_as :default

  def perform(notification)
    # no need to send email if notification has been read already
    return if notification.read_at.present?

    # suspending email notifications temporarily for now
    # Notification::EmailNotificationService.new(notification: notification).perform
  end
end
