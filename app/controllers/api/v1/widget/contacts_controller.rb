class Api::V1::Widget::ContactsController < Api::V1::Widget::BaseController
  before_action :process_hmac, only: [:set_user]
  before_action :validate_contact, only: [:set_user]
  def show; end

  def update
    contact_identify_action = ContactIdentifyAction.new(
      contact: @contact,
      params: permitted_params.to_h.deep_symbolize_keys
    )
    @contact = contact_identify_action.perform
  end

  # TODO : clean up this with proper routes delete contacts/custom_attributes
  def destroy_custom_attributes
    @contact.custom_attributes = @contact.custom_attributes.excluding(params[:custom_attributes])
    @contact.save!
    render json: @contact
  end

  def set_user
    contact = @is_a_different_contact ? build_contact : @contact

    contact_identify_action = ContactIdentifyAction.new(
      contact: contact,
      params: permitted_params.to_h.deep_symbolize_keys
    )
    @contact = contact_identify_action.perform
  end

  private

  def build_contact
    contact_inbox = @web_widget.create_contact_inbox
    contact = contact_inbox.contact

    payload = { source_id: contact_inbox.source_id, inbox_id: @web_widget.inbox.id }
    @widget_auth_token = ::Widget::TokenService.new(payload: payload).generate_token

    contact
  end

  def validate_contact
    @is_a_different_contact = false

    return unless @contact.resolved?

    identifier_mismatch = @contact.identifier.present? && @contact.identifier != permitted_params[:identifier]
    email_mismatch = @contact.email.present? && @contact.email != permitted_params[:email]
    phone_mismatch = @contact.phone_number.present? && @contact.phone_number != permitted_params[:phone_number]

    @is_a_different_contact = identifier_mismatch || email_mismatch || phone_mismatch
  end

  def process_hmac
    return unless should_verify_hmac?

    render json: { error: 'HMAC failed: Invalid Identifier Hash Provided' }, status: :unauthorized unless valid_hmac?

    @contact_inbox.update(hmac_verified: true)
  end

  def should_verify_hmac?
    return false if params[:identifier_hash].blank? && !@web_widget.hmac_mandatory

    # Taking an extra caution that the hmac is triggered whenever identifier is present
    return false if params[:custom_attributes].present? && params[:identifier].blank?

    true
  end

  def valid_hmac?
    params[:identifier_hash] == OpenSSL::HMAC.hexdigest(
      'sha256',
      @web_widget.hmac_token,
      params[:identifier].to_s
    )
  end

  def permitted_params
    params.permit(:website_token, :identifier, :identifier_hash, :email, :name, :avatar_url, :phone_number, custom_attributes: {},
                                                                                                            additional_attributes: {})
  end
end
