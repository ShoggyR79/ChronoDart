const { LolApi, TftApi, Constants } = require('twisted')
const lolapi = new LolApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 10
})
const tftapi = new TftApi()

const oneWeek = 604800000
const twoWeeks = 1209600000
const idToName = {
    0: "custom",
    430: "blind",
    420: "soloq",
    440: "flex",
    830: "ai",
    400: "blind",
    450: "aram",
    840: "ai",
    850: "ai",
    900: "urf",
    1900: "urf",
    720: "clash"
}
const getMatches = async (req, res) => {
    try {
        const { sums } = req.params;
        // getting the puuid
        const {
            response: {
                puuid
            }
        } = await lolapi.Summoner.getByName(sums, Constants.Regions.AMERICA_NORTH)

        const NOW = Date.now();
        // building the query
        const firstQuery = {
            count: 100,
            startTime: Math.floor((NOW - oneWeek) / 1000)
        }
        const secondQuery = {
            count: 100,
            startTime: Math.floor((NOW - twoWeeks) / 1000),
            endTime: Math.floor((NOW - oneWeek) / 1000)
        }
        // calling the api
        const response1 = await lolapi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, firstQuery)
        const response2 = await lolapi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, secondQuery)
        const response = [...response1.response, ...response2.response]
        console.log(response.length)
        const numOfGames = {
            total: response.length,
            custom: 0,
            blind: 0,
            soloq: 0,
            flex: 0,
            ai: 0,
            aram: 0,
            urf: 0,
            clash: 0
        }
        let durationLastTwoWeeks = 0;

        const matches = await Promise.all(response.map(async (matchid) => {
            const match = await (await lolapi.MatchV5.get(matchid, Constants.RegionGroups.AMERICAS)).response.info
            durationLastTwoWeeks += match.gameDuration
            numOfGames[idToName[match.queueId]]++
            return match
        }))
        let durationHour = durationLastTwoWeeks / 3600
        let durationString = (Math.round(durationHour * 100) / 100).toString() + " Hours"

        res.status(200).send({ durationLastTwoWeeks, durationString, numOfGames })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports = {
    getMatches
}