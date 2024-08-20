module.exports = function sortMiddleware (req,res, next){
    res.locals._sort = {
        enabled: false,
        type: 'default'
    }
    if(req.query.hasOwnProperty('_sort')){
        // res.locals._sort.enabled = true;
        // res.locals._sort.type = rep.query.type;
        // res.locals._sort.column = rep.query.column;
        Object.assign(res.locals._sort,{
            enabled: true,
            type: req.query.type,
            column: req.query.column
        })
    }
    next();
}