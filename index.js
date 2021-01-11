const graphql = require('graphql-request')

var channels = [];
var schedules = [];
const endpoint = 'https://replatore.com'

const graphQLClient = new graphql.GraphQLClient(endpoint, {
    headers: {
        authentication: 'Ru8DgpCthA9M6hBFH52mEjVkUjrYxDqM7N5kDwTTGnSJ9yQVmzDbTbuh4aakCXzBpGm85sWuZUq3Kh3T2PBvt45G3f6Q9Fc6t7WEcaegNY5tdSnBtZNHtzN6',
    },
})

async function main() {
    await fetchChannels()
    await fetchSchedules()
    printContent()
}

async function fetchChannels() {
    const query = graphql.gql`
    {
      channels(
        filter: {
          OR: [
            { title: "NPO 1 HD" }
            { title: "RTL 4 HD" }
          ]
        }
        sort: CHANNELNUMBER_ASC
      ) {
        title
        epgId
      }
    }
  `

    const data = await graphQLClient.request(query)
    channels = data.channels;
}

async function fetchSchedules() {
    let start_date = new Date("07 Jan 2021").getTime()
    let end_date = start_date + 172800000 // Add 2 days

    const query = graphql.gql`
    {
      schedules(
        filter: {
          OR: [
            { o: "${channels[0].epgId}" }
            { o: "${channels[1].epgId}" }
          ]
          _operators: {
            s: { gte: ${start_date} }
            e: { lte: ${end_date} }
          }
        }
        sort: S_ASC
      ) {
        o
        t
        s
        e
        p {
          title
          description
        }
      }
    }
  `

    const data = await graphQLClient.request(query)
    data.schedules.map(function (schedule) {
        schedule.s = new Date(schedule.s).toUTCString()
        schedule.e = new Date(schedule.e).toUTCString()
        return schedule
    })
    schedules["npo1"] = data.schedules.filter(schedule => schedule.o == channels[0].epgId);
    schedules["rtl4"] = data.schedules.filter(schedule => schedule.o == channels[1].epgId);
}

function printContent() {
    console.log("------------ NPO 1 ------------\n")
    printSchedules(schedules["npo1"]);

    console.log("------------ RTL 4 ------------")
    printSchedules(schedules["rtl4"]);
}
function printSchedules(schedules) {
    for (i = 0; i < schedules.length; i++) {
        let schedule = schedules[i];
        console.log('%s - %s / %s', schedule.s, schedule.e, schedule.p.title);
        console.log(schedule.p.description);
        console.log("\n--\n");
    }
}


main().catch((error) => console.error(error))