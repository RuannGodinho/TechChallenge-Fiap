const { getAllUsers } = require("../services/users");

function getUsers(req, res) {
    const users = getAllUsers()
    res.send('respond with a resource');
}

module.exports = {
    getUsers
}