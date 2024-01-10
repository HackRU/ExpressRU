const { getCollection } = require('../util.js');

exports.get_stats = async (req, res, next) => {
    console.log(req.user);
    const Users = await getCollection('users');
    const registered = await Users.countDocuments({"registration_status": "registered"});
    const rejected = await Users.countDocuments({"registration_status": "rejected"});
    const confirmation = await Users.countDocuments({"registration_status": "confirmation"});
    const coming = await Users.countDocuments({"registration_status": "coming"});
    const not_coming = await Users.countDocuments({"registration_status": "not_coming"});
    const waitlist = await Users.countDocuments({"registration_status": "waitlist"});
    const confirmed = await Users.countDocuments({"registration_status": "confirmed"});
    const checked_in = await Users.countDocuments({"registration_status": "checked_in"});
    res.send({
        "registered": registered,
        "rejected": rejected,
        "confirmation": confirmation,
        "coming": coming,
        "not-coming": not_coming,
        "waitlist": waitlist,
        "confirmed": confirmed,
        "checked-in": checked_in
    });
}