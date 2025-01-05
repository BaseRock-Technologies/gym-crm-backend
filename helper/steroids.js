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

module.exports = {
    groupTheArrayOn,
}