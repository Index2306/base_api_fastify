exports.parseOption = (query) => {
    const option = {
        page: parseInt(query.page, 10),
        page_size: parseInt(query.page_size, 10),
        paginate: {
            perPage: parseInt(query.page_size, 10) || 20,
            currentPage: parseInt(query.page, 10) || 1,
            isLengthAware: true,
        },
        order_by: query.order_by,
        order_direction: query.order_direction || 'desc',
    }

    return option
}
