const { LolApi, TftApi, Constants } = require('twisted')
const Match = require('../Models/matches.js')

const lolapi = new LolApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 10
})
const tftapi = new TftApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 10
})

const days = 14;
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
    720: "clash",
}






const getTimePlayed = async (sums) => {
    try {
        const {
            response: {
                puuid
            }
        } = await lolapi.Summoner.getByName(sums, Constants.Regions.AMERICA_NORTH)
        const NOW = Date.now();
        const oneWeekP = (NOW - oneWeek)
        const twoWeekP = (NOW - twoWeeks)
        const oneWeekBefore = Math.floor(oneWeekP / 1000)
        const twoWeekBefore = Math.floor(twoWeekP / 1000)

        // building the query
        const firstQuery = {
            count: 100,
            startTime: oneWeekBefore
        }
        const secondQuery = {
            count: 100,
            startTime: twoWeekBefore,
            endTime: oneWeekBefore
        }
        // calling the api
        const response1 = await lolapi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, firstQuery)
        const response2 = await lolapi.MatchV5.list(puuid, Constants.RegionGroups.AMERICAS, secondQuery)
        const response = [...response1.response, ...response2.response]

        const responsetft1 = await tftapi.Match.list(puuid, Constants.RegionGroups.AMERICAS, firstQuery)
        const responsetft2 = await tftapi.Match.list(puuid, Constants.RegionGroups.AMERICAS, secondQuery)
        const responsetft = [...responsetft1.response, ...responsetft2.response]


        const numOfGames = {
            total: response.length,
            custom: 0,
            blind: 0,
            soloq: 0,
            flex: 0,
            ai: 0,
            aram: 0,
            urf: 0,
            clash: 0,
            tft: 0
        }
        let durationLastTwoWeeks = 0;
        let durationByDay = [];
        for (let i = 0; i < days; ++i) {
            durationByDay.push(0);
        }
        
        // LOLAPI
        await Promise.all(response.map(async (matchid) => {
            let matchData = await Match.findOne({ matchid })
            if (!matchData) {
                // need to get new
                const match = await (await lolapi.MatchV5.get(matchid, Constants.RegionGroups.AMERICAS)).response.info
                matchData = {
                    matchid,
                    gameDuration: match.gameDuration,
                    gameCreation: match.gameCreation,
                    queueId: match.queueId,
                }
                // console.log(matchData)
                await Match.create(matchData)
            }
            durationLastTwoWeeks += matchData.gameDuration
            let curDay = Math.floor((matchData.gameCreation - twoWeekP) / 86400000)
            // console.log(matchData.gameCreation, twoWeekP, curDay)
            durationByDay[curDay] += matchData.gameDuration
            numOfGames[idToName[matchData.queueId]]++
            return matchData
        }))

        // TFTAPI
        await Promise.all(responsetft.map(async (matchid) => {
            let matchData = await Match.findOne({ matchid })
            if (!matchData) {
                // need to get new
                const match = await (await tftapi.Match.get(matchid, Constants.RegionGroups.AMERICAS)).response.info
                matchData = {
                    matchid,
                    gameDuration: match.game_length,
                    gameCreation: match.game_datetime,
                    queueId: match.queue_id,
                }
                // console.log(matchData)
                await Match.create(matchData)
            }
            durationLastTwoWeeks += matchData.gameDuration
            let curDay = Math.floor((matchData.gameCreation - twoWeekP) / 86400000)
            // console.log(matchData.gameCreation, twoWeekP, curDay)
            durationByDay[curDay] += matchData.gameDuration
            numOfGames["tft"]++
            return matchData
        }))
        durationByDay = durationByDay.map((time, index) => {
            return {
                day: index + 1,
                time,
                timeString: (Math.round((time / 3600) * 100) / 100).toString() + " Hours"
            }
        })
        // console.log(durationByDay)
        let durationHour = durationLastTwoWeeks / 3600
        let durationString = (Math.round(durationHour * 100) / 100).toString() + " Hours"
        return { status: "success", data: { summoner: sums, durationLastTwoWeeks, durationString, numOfGames, durationByDay } }
    } catch (error) {
        return { status: "fail", error }
    }
}

module.exports = {
    getTimePlayed
}