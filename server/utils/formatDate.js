const formatDate = (unix) => {
    const time = new Date(unix).toISOString().slice(0, 19).replace('T', ' ');
    
    return time;
}

module.exports = {formatDate}