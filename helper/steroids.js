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

const formatTime = (timestamp) => {
    if (!timestamp) {
        return "-";
    }
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${hours}:${minutes}:${seconds} ${ampm}`;
};

module.exports = {
    groupTheArrayOn,
    formatTimestamp,
    formatTime,
}