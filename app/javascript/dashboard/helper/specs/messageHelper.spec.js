import { findReplaceMessageVariables } from '../messageHelper';

const replacementList = {
  'contact.name': 'John',
  'contact.email': 'john.p@example.com',
  'contact.phone': '1234567890',
  'conversation.id': 1,
  'agent.name': 'Samuel',
  'agent.email': 'samuel@gmail.com',
};

describe('#findReplaceMessageVariables', () => {
  it('returns the message with variable name', () => {
    const message = 'hey {{contact.name}} how may I help you?';
    expect(findReplaceMessageVariables({ message, replacementList })).toBe(
      'hey John how may I help you?'
    );
  });

  it('returns the message with variable name having white space', () => {
    const message = 'hey {{contact.name}} how may I help you?';
    expect(findReplaceMessageVariables({ message, replacementList })).toBe(
      'hey John how may I help you?'
    );
  });

  it('returns the message with variable email', () => {
    const message =
      'No issues. We will send the reset instructions to your email at {{contact.email}}';
    expect(findReplaceMessageVariables({ message, replacementList })).toBe(
      'No issues. We will send the reset instructions to your email at john.p@example.com'
    );
  });

  it('returns the message with multiple variables', () => {
    const message =
      'hey {{ contact.name }}, no issues. We will send the reset instructions to your email at {{contact.email}}';
    expect(findReplaceMessageVariables({ message, replacementList })).toBe(
      'hey John, no issues. We will send the reset instructions to your email at john.p@example.com'
    );
  });

  it('returns the message if the variable is not present in replacementList', () => {
    const message = 'Please dm me at {{contact.twitter}}';
    expect(findReplaceMessageVariables({ message, replacementList })).toBe(
      'Please dm me at '
    );
  });
});
