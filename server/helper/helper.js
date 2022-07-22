const sendRefreshToken = (res, token) => {
    res.cookie('refreshtoken', token, {httpOnly: true, secure: false})
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
