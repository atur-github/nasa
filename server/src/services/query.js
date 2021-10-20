function getPagination({limit = 0, page = 1}) {
    const _limit = Math.abs(limit);
    const _page = Math.abs(page);
    const skip = (_page - 1) * _limit;

    return {
        skip,
        limit: _limit
    }
}

module.exports = {
    getPagination
}