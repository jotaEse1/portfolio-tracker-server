const sendRefreshToken = (res, token) => {
    res.cookie('refreshtoken', token, {httpOnly: true})
}

const sendAccessToken = (res, id, username, token) => {
    res.send({
        success: true,
        payload: {
            token, 
            id,
            username,
            status: 200

        }
    })
}

module.exports = {sendAccessToken, sendRefreshToken}
