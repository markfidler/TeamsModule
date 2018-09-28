var jwt = require('jsonwebtoken')
var axios = require('axios')

const sendTeamMemberInvite = function(email, team) {
    const dev = process.env.NODE_ENV === 'development' ? true : false
    console.log('sendTeamMemberInvite', email, team)
    const API_KEY = process.env.SG_APIKEY
    const token = jwt.sign({ email: email, team: team.slug }, API_KEY, { expiresIn: '7d' })
    let origin = 'https://teams.advancedalgos.net'
    const params = '/activate-team-membership?token='
    if (dev){
      origin = 'http://localhost:3001'
    }

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : origin,
      'Access-Control-Allow-Credentials': 'true'
    };

    const data = JSON.stringify({
        "personalizations": [
          {
            "to": [
              {
                "email": email
              }
            ],
            dynamic_template_data: {
              "aateaminvitelink": origin + params + token,
              "aateamname": team.name,
              "subject": "INVITATION: Join team " + team.name
            },
            "subject": "INVITATION: Join team " + team.name
          }
        ],
        "from": {
          "email": "noreply@advancedalgos.net",
          "name": "Advanced Algos Teams"
        },
        "reply_to": {
          "email": "feedback@advancedalgos.net",
          "name": "Advanced Algos Teams"
        },
        "template_id": process.env.SG_INVITE_EMAILID
      })

    let sendVerify = axios({
        method: 'post',
        url: 'https://api.sendgrid.com/v3/mail/send',
        data: data,
        headers:{
            'content-type': 'application/json',
            'authorization': 'Bearer ' + API_KEY
        }
    })
    .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
          return 'Success'
        } else {
          throw response.data.errors[0].message
        }
    })
    .catch(function (error) {
        return `${error.status}-${error.response.data.errors[0].message}`
    })
    return sendVerify
}

module.exports = { sendTeamMemberInvite }