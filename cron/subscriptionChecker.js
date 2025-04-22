const cron = require("node-cron")
const User = require('./../models/UserModel');
const Email = require("./../utils/email")

cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expiredUsers = await User.find({
        isSubscribed: true,
        subscriptionEnd: { $lte: now }
    });

    for (const user of expiredUsers) {
        user.isSubscribed = false;
        user.subscriptionName = undefined;
        user.subscriptionStart = undefined;
        user.subscriptionEnd = undefined;
        await user.save({validateBeforeSave: false});
        try {
            await new Email(user, "http://127.0.0.1:3000/api/v1/subscription/1-month").sendSubscribeExpired();
        }catch (err){
            console.log(`failed to send Email!: ${err}`);
        }

    }
});