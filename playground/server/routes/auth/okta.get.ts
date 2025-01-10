import { EventHandlerRequest, H3Event } from 'h3'

export default defineOAuthOktaEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { tokens, user }) {
    await setUserSession(event, {
      user,
      tokens,
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, tokens.return_to ?? '/')
  },
  // Optional, will return a json error and 401 status code by default
  onError(event: H3Event<EventHandlerRequest>, error: any) {
    console.error('Okta OAuth error:', error)
    return sendRedirect(event, '/')
  },

})
