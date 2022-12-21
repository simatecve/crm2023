import endPoints from 'widget/api/endPoints';
import { API } from 'widget/helpers/axios';

export default {
  update: ({ messageId, email, values }) => {
    const urlData = endPoints.updateMessage(messageId);
    return API.patch(urlData.url, {
      contact: { email },
      message: { submitted_values: values },
    });
  },

  addParticipantToMeeting: messageId => {
    const urlData = endPoints.addParticipantToMeeting(messageId);
    return API.post(urlData.url);
  },
};
