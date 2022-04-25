module Labelable
  extend ActiveSupport::Concern
  include Events::Types

  included do
    acts_as_taggable_on :labels
  end

  def update_labels(labels = nil)
    update!(label_list: labels)
  end

  def add_labels(new_labels = nil)
    new_labels << labels
    update!(label_list: new_labels)
  end

  private

  def notify_label_update
    return unless saved_change_to_label_list?

    previous_labels, current_labels = previous_changes[:label_list]
    return unless (previous_labels.is_a? Array) && (current_labels.is_a? Array)

    added_labels = current_labels - previous_labels
    removed_labels = previous_labels - current_labels

    dispatch_label_event(LABEL_ADDED, added_labels)
    dispatch_label_event(LABEL_REMOVED, removed_labels)
  end

  def dispatch_label_event(event_name, labels)
    return unless labels.size.positive?

    Rails.configuration.dispatcher.dispatch(event_name, Time.zone.now, type: self.class.name, data: self, labels: labels)
  end
end
