import type { H3Event } from 'h3'
import { eventHandler, getQuery, sendRedirect } from 'h3'
import { withQuery } from 'ufo'
import { defu } from 'defu'
import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from '../utils'
import { useRuntimeConfig } from '#imports'
import type { OAuthConfig } from '#auth-utils'

export interface OAuthOktaConfig {
  /**
   * Okta OAuth Client ID
   * @default process.env.NUXT_OAUTH_OKTA_CLIENT_ID
   */
  clientId?: string
  /**
   * Okta OAuth Client Secret
   * @default process.env.NUXT_OAUTH_OKTA_CLIENT_SECRET
   */
  clientSecret?: string
  /**
   * Okta OAuth Issuer
   * @default process.env.NUXT_OAUTH_OKTA_DOMAIN
   */
  domain?: string
  /**
   * Okta OAuth Authorization Server
   * @see https://developer.okta.com/docs/guides/customize-authz-server/main/#create-an-authorization-server
   * @default process.env.NUXT_OAUTH_OKTA_AUTH_SERVER_ID
   */
  authorizationServer?: string
  /**
   * Okta OAuth Audience
   * @default process.env.NUXT_OAUTH_OKTA_AUDIENCE
   */
  audience?: string
  /**
   * Okta OAuth Scope
   * @default []
   * @see https://developer.okta.com/docs/api/openapi/okta-oauth/guides/overview/#scopes
   * @example ['openid']
   */
  scope?: string[]
  /**
   * Require email from user, adds the ['email'] scope if not present
   * @default false
   */
  emailRequired?: boolean
  /**
   * Maximum Authentication Age. If the elapsed time is greater than this value, the OP must attempt to actively re-authenticate the end-user.
   * @default 0
   * @see https://developer.okta.com/blog/2023/10/24/stepup-okta
   */
  maxAge?: number
  /**
   * Login connection. If no connection is specified, it will redirect to the standard Okta login page and show the Login Widget.
   * @default ''
   * @see https://developer.okta.com/docs/guides/social-login/facebook/main/
   * @example 'github'
   */
  connection?: string
  /**
   * Extra authorization parameters to provide to the authorization URL
   * @see https://developer.okta.com/docs/guides/social-login/facebook/main/
   * @example { display: 'popup' }
   */
  authorizationParams?: Record<string, string>
  /**
   * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
   * @default process.env.NUXT_OAUTH_OKTA_REDIRECT_URL or current URL
   */
  redirectURL?: string
}

export function defineOAuthOktaEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthOktaConfig>) {
  let return_to: string = ''
  let openidConfig: any = null;

  const getOpenidConfig = async (openidConfigurationUrl: string) => {
    if (!openidConfig) {
      openidConfig = await $fetch(openidConfigurationUrl);
    }
    return openidConfig;
  }

  const stateMap = new Map<string, Date>()
  const getState = (): string => {
    const state = Math.random().toString(36).substring(2)
    stateMap.set(state, new Date())
    return state
  }
  const deleteState = (state: string) => {
    stateMap.delete(state)
  }

  return eventHandler(async (event: H3Event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.okta, {
      authorizationParams: {},
    }) as OAuthOktaConfig

    if (!config.clientId || !config.clientSecret || !config.domain) {
      return handleMissingConfiguration(event, 'okta', ['clientId', 'clientSecret', 'domain'], onError)
    }

    const authServer = config.authorizationServer
    const openidConfigurationUrl = authServer ? `https://${config.domain}/oauth2/${authServer}/.well-known/openid-configuration` : `https://${config.domain}/.well-known/openid-configuration`

    const openidConfig = await getOpenidConfig(openidConfigurationUrl);

    const authorizationURL = openidConfig.authorization_endpoint
    const tokenURL = openidConfig.token_endpoint
    const userInfoUrl = openidConfig.userinfo_endpoint

    const query = getQuery<{ code?: string, state?: string, return_to?: string }>(event)
    const redirectURL = config.redirectURL || getOAuthRedirectURL(event)

    if (query.return_to) {
      return_to = query.return_to
    }

    if (!query.code) {
      config.scope = config.scope || ['openid', 'offline_access']
      if (config.emailRequired && !config.scope.includes('email')) {
        config.scope.push('email')
      }
      // Redirect to Okta Oauth page
      return sendRedirect(
        event,
        withQuery(authorizationURL as string, {
          response_type: 'code',
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: config.scope.join(' '),
          audience: config.audience || '',
          max_age: config.maxAge || 0,
          connection: config.connection || '',
          state: getState(),
          ...config.authorizationParams,
        }),
      )
    }

    const tokens = await requestAccessToken(tokenURL as string, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        response_type: 'code',
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code,
        state: query.state,
      },
    })

    deleteState(query.state ?? '')
    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, 'okta', tokens, onError)
    }

    const tokenType = tokens.token_type
    const accessToken = tokens.access_token

    // TODO: improve typing
    let user: any = await $fetch(userInfoUrl, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })

    if (!user) {
      const error = createError({
        statusCode: 410,
        message: 'Could not get Okta user',
        data: tokens,
      })
      if (!onError) throw error
      return onError(event, error)
    }

    user.return_to = return_to

    return onSuccess(event, {
      tokens,
      user,
    })
  })
}
