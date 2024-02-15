const express = require('express');
const bcrypt = require('bcrypt');
const { Users, Daily, File, Balance, History } = require("../models/users.js");
const router = express.Router();

router.get("/", (req, res) => {
    if (req.session.user || req.session.clientId) {
        const username = req.session.user;
        res.render("dashboard", { username: username});
        return;
    }
    res.render('index');
});

router.post("/signup", async function (req, res) {
    try {
        const existingUser = await Users.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

        if (existingUser) {
            const alertScript = `
                <script>
                    alert('Username or email already taken!');
                    window.location.href = '/';
                </script>
            `;
            res.send(alertScript);
            return;
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let newUsers = new Users({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        let newBalance = new Balance({
            username: req.body.username,
            value: 0
        });

        await newUsers.save();
        await newBalance.save();

        res.redirect('/');
    } catch (error) {
        console.error('An error occurred during signup:', error);
        res.status(500).send('An error occurred during signup.');
    }
});

router.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await Users.findOne({ username: username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            const alertScript = `
                <script>
                    alert('Invalid username or password. Please try again.');
                    window.location.href = '/';
                </script>
            `;
            res.send(alertScript);
            return;
        }
        req.session.clientId = 'abc123';
        req.session.myNum = 5;

        console.log("Login successfully from " + username + "!");
        req.session.user = username;
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/dashboard", (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }
    const username = req.session.user;
    res.render("dashboard", { username: username});
});

router.get("/daily", (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }
    res.render('daily')
});

router.get("/money", (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }
    res.render('money');
});

router.post("/dailytask", async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        return res.redirect("/");
    }
    try {
        let newDaily = new Daily({
            username: req.session.user,
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            uniqueId: req.body.uniqueId,
            nameday: req.body.nameday
        });

        await newDaily.save();
        res.status(200).json({ success: true, message: 'Daily task saved successfully' });
    } catch (error) {
        console.error("Error saving daily task:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } 
});

router.get("/carddaily", async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }

    try {
        const dailyTasks = await Daily.find({ username: req.session.user });
        const formattedTask = dailyTasks.map(task => ({
            username: task.username,
            title: task.title,
            description: task.description,
            date: task.date,
            uniqueId: task.uniqueId,
            nameday: task.nameday
        }));

        res.json({ dailyTasks: formattedTask });
    } catch (error) {
        console.error("Error retrieving daily tasks:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.delete("/dailytask/:uniqueId", async (req, res) => {
    const uniqueId = req.params.uniqueId
    try {
        const deleteTask = await Daily.findOneAndDelete({ uniqueId: uniqueId });

        if (!deleteTask) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
});

router.get('/getBalance', async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }
    try {
        const balance = await Balance.findOne({ username: req.session.user });
        if (balance) {
            res.json({ value: balance.value });
        } else {
            res.status(404).json({ error: 'Balance data not found!' });
        }
    } catch (error) {
        console.error('An error occurred while getting the balance:', error);
        res.status(500).send('An error occurred while getting the balance,');
    }
})

router.post('/updateBalance', async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }
    const newValue = req.body.balance;
    try {
        await Balance.findOneAndUpdate({ username: req.session.user }, { value: newValue }, { upsert: true, new: true });
        res.send('Successfully updated balance.');
    } catch (error) {
        res.status(500).send('An error occurred while updating the balance!');
    }
});

router.post("/history", async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        return res.redirect("/");
    }
    try {
        let newHistory = new History({
            username: req.session.user,
            formattedDate: req.body.formattedDate,
            formattedTime: req.body.formattedTime,
            type: req.body.type,
            depositeAmount: req.body.depositeAmount,
            withdrawAmount: req.body.withdrawAmount
        });

        await newHistory.save();
        res.status(200).json({ success: true, message: 'Daily task saved successfully' });
    } catch (error) {
        console.error("Error saving daily task:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } 
});

router.get("/gethistory", async (req, res) => {
    if (!req.session.user || !req.session.clientId) {
        res.redirect("/");
        return;
    }

    try {
        const getHistory = await History.find({ username: req.session.user });
        const formattedHistory = getHistory.map(history => ({
            username: history.username,
            formattedDate: history.formattedDate,
            formattedTime: history.formattedTime,
            type: history.type,
            depositeAmount: history.depositeAmount,
            withdrawAmount: history.withdrawAmount
        }));

        res.json({ getHistory: formattedHistory });
    } catch (error) {
        console.error("Error retrieving daily tasks:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            res.status(500).send("Internal Server Error");
        } else {
            res.json({ success: true, message: "Logout successful" });
        }
    });
});

module.exports = router;