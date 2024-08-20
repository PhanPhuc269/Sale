const newRouter=require('./news');
const siteRouter=require('./sites');
const coursesRouter=require('./courses');
const meRouter=require('./me');

function router(app)
{
    app.use('/news',newRouter);
    app.use('/', siteRouter)
    app.use('/me', meRouter)
    app.use('/courses', coursesRouter)
    

    // app.get('/search', function (req, res) {
    //     res.render('search');
    // });

    // app.listen(port, () => {
    //     console.log(`Server is running at http://localhost:${port}`);
    // });
}

module.exports = router