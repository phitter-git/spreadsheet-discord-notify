const ncron = require('node-cron')
const axios = require('axios')

const test_server = false
const test_webhook = 'discord webhook'
const prod_webhook = 'discord webhook'
const resource_uri = 'your spreadsheer uri'

const sec = '0'
const min = '0'
const hrs = '12,22'
const DAY = '*'
const MON = '*'
const WEK = '4'

const m_row = 11
const d_row = 12
const from_row = 14
const here_row = 36
const username_col = 1
const sat_from_col = 2
const sat_here_col = 14
const sun_from_col = 15
const sun_here_col = 27

const schedule = `${sec} ${min} ${hrs} ${DAY} ${MON} ${WEK}`

ncron.schedule(schedule, async () => {
  const sheet = await axios.get(resource_uri)
  const cells = sheet.data.feed.entry
  const users = {}

  let sat_day = ''
  let sun_day = ''

  cells.forEach((cell) => {
    cell = decode(cell)
    if (m_row === cell.row && sat_from_col === cell.col) {
      sat_day += cell.val
    }
    if (d_row === cell.row && sat_from_col === cell.col) {
      sat_day += cell.val
    }
    if (m_row === cell.row && sun_from_col === cell.col) {
      sun_day += cell.val
    }
    if (d_row === cell.row && sun_from_col === cell.col) {
      sun_day += cell.val
    }

    if (from_row <= cell.row && cell.row <= here_row) {
      if (cell.col === username_col) {
        users[cell.row] = {
          name : cell.val,
          sat : 0,
          sun : 0
        }
      }

      if (sat_from_col <= cell.col && cell.col <= sat_here_col) {
        users[cell.row].sat++
      }

      if (sun_from_col <= cell.col && cell.col <= sun_here_col) {
        users[cell.row].sun++
      }
    }
  })

  let sat_message = sat_day
  let sun_message = sun_day

  for(let [key, user] of Object.entries(users)) {
    const name = userids[user.name] ? `<@${userids[user.name]}>` : user.name
    if (user.sat === 0) {
      if (sat_message === sat_day) {
        sat_message += `の出席が未記入の人は${name}さん`
      } else {
        sat_message += `、${name}さん`
      }
    }
    if (user.sun === 0) {
      if (sun_message === sun_day) {
        sun_message += `の出席が未記入の人は${name}さん`
      } else {
        sun_message += `、${name}さん`
      }
    }
  }

  if (sat_message === sat_day) {
    sat_message += `の出席は全員記入済みです。`
  } else {
    sat_message += 'です。'
  }
  
  if (sun_message === sun_day) {
    sun_message += `の出席は全員記入済みです。`
  } else {
    sun_message += 'です。'
  }

  const event = 'event name'
  const message = `${sat_day}, ${sun_day}は${event}の日です。\n出欠表の記入及び変更は__**23時までに**__行ってください。\n\n${sat_message}\n${sun_message}`
  const webhook = test_server ? test_webhook : prod_webhook
  await axios.post(webhook, {
    content : message
  }).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
})

const decode = (cell) => {
  return {
    row : parseInt(cell.gs$cell.row),
    col : parseInt(cell.gs$cell.col),
    val : cell.gs$cell.$t
  }
}

const userids = {
  'user A': 'discord id'
}