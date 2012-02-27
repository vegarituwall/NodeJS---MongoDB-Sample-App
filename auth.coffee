global.everyauth = require 'everyauth'
global.RW ||= {}
require './secrets'

usersById = {}
nextUserId = 0

addUser = (source, sourceUser) ->
  user = undefined
  if arguments.length is 1
    user = sourceUser = source
    user.id = ++nextUserId
    return usersById[nextUserId] = user
  else
    user = usersById[++nextUserId] = id: nextUserId
    user[source] = sourceUser
  user
  
everyauth.everymodule.findUserById (userId, callback) ->
  user = usersById[parseInt(userId)]
  user = user.facebook if user
  _console.debug "User: #{user.name}" if user
  callback null, user
  user
  
everyauth.everymodule.handleLogout (request, response) ->
  # Put you extra logic here
  console.log "Logging out!"
  request.logout() # The logout method is added for you by everyauth, too
  
  # And/or put your extra logic here
  
  response.writeHead 303, 'Location': @logoutRedirectPath()
  response.end()
  
everyauth.everymodule.logoutPath('/logout')
everyauth.everymodule.logoutRedirectPath('/login')

everyauth.facebook
  .appId(RW.secrets.facebook.key)
  .appSecret(RW.secrets.facebook.secret)
  .handleAuthCallbackError((request, response) ->
    console.log "FACEBOOK ERROR"
    console.log request
    # If a user denies your app, Facebook will redirect the user to
    # /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
    # This configurable route handler defines how you want to respond to
    # that.
    # If you do not configure this, everyauth renders a default fallback
    # view notifying the user that their authentication failed and why.
  ).findOrCreateUser((session, accessToken, accessTokExtra, fbUserMetadata) ->
    # find or create user logic goes here
    console.log accessToken
    #_console.debug require('util').inspect(session)
    #_console.debug require('util').inspect(fbUserMetadata)
    addUser "facebook", fbUserMetadata
  ).redirectPath('/login')
  
app.use express.cookieParser()
app.use express.session(secret: "rituwall")
app.use everyauth.middleware()

everyauth.helpExpress(app)
