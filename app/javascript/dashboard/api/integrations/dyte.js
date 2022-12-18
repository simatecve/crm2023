/* global axios */

import ApiClient from '../ApiClient';

class DyteAPI extends ApiClient {
  constructor() {
    super('integrations/dyte', { accountScoped: true });
  }

  createAMeeting(conversationId) {
    return axios.post(`${this.url}/create_a_meeting`, {
      conversation_id: conversationId,
    });
  }

  addParticipantToMeeting(messageId) {
    return axios.post(this.baseUrl(), {
      message_id: messageId,
    });
  }
}

export default new DyteAPI();
