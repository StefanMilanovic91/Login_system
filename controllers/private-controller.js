

exports.private = (req, res) => {
    console.log(req.user);
    res.send('Private data');
}