const { getTimePlayed } = require('../utils/getTimePlayed.js');

const getMatches = async (req, res) => {

    try {
        const { sums } = req.params;
        // getting the puuid
        const response = await getTimePlayed(sums)
        if (response.status == "success"){
            res.status(200).send(response.data)
        }else{
            res.status(500).send(response.error)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports = {
    getMatches
}