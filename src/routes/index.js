const newRouter=require('./news');
const siteRouter=require('./sites');
const coursesRouter=require('./courses');
const meRouter=require('./me');
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    if(req.session.authenticated != true)
    {
        return res.redirect('/authen-verify');
    }
    next();
}
function router(app)
{
    app.use('/news',requireLogin, newRouter);
    app.use('/me',requireLogin,  meRouter)
    app.use('/courses',requireLogin,  coursesRouter)
    app.use('/', siteRouter)

    // app.get('/search', function (req, res) {
    //     res.render('search');
    // });

    // app.listen(port, () => {
    //     console.log(`Server is running at http://localhost:${port}`);
    // });
}

module.exports = router