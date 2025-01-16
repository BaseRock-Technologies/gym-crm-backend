const groupTheArrayOn = (arr, groupBy) => {
    return arr.reduce((acc, item) => {
        const key = item[groupBy] || 'default';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
}

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    };

    return date.toLocaleDateString('en-US', options).replace(',', '');
};


module.exports = {
    groupTheArrayOn,
    formatTimestamp,
}