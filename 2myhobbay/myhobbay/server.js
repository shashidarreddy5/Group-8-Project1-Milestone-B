const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const auth = require('./auth');
const profile = require('./profile');
const database = require("./database")
app.use(bodyParser.json());
const fileupload = require('express-fileupload')
app.use(
    fileupload())
const conn = database.connect()

app.use(express.static("public"))


const popRes = (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*")
    return res
}
app.post("/api/upload-pic/", auth.authenticateToken, (req, res) => {
    const fileName = req.files.myFile.name
    const path = __dirname + '/public/upload-images/' + fileName

    req.files.myFile.mv(path, (error) => {
        if (error) {
            console.error(error)
            res.writeHead(500, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                status: 'error',
                message: error
            }))
            return
        }

        path_ = "/upload-images/" + fileName
        profile.upload_image(conn, res, path_, req.user)
    })
})
app.post("/api/login/", (req, res) => {
    res = popRes(req, res)
    data = {
        username: req.body.username,
        password: req.body.password
    }
    if (data.username) {
        if (data.password) {
            auth.login(conn, data, res)
        } else {
            res.status(403).send(JSON.stringify({
                "response": "please fill all the required fields [password] missing"
            }));
        }

    } else {
        res.status(403).send(JSON.stringify({
            "response": "please fill all the required fields [username] missing"
        }));
    }

});
app.post("/api/update-profile/", auth.authenticateToken, (req, res) => {
    user_id = req.user
    data = req.body
    data.user = user_id
    profile.update_profile(conn, data, res)
})


app.post("/api/signup", (req, res) => {
    res = popRes(req, res)
    data = req.body
    if (data.password1 === data.password2) {
        if (data.password2) {
            if (data.username) {
                state = auth.signup(conn, {
                    username: data.username,
                    password: data.password1,
                    first_name: data.first_name,
                    last_name: data.last_name,
                }, res)
            }
        } else {
            res.status(403).send(JSON.stringify({
                "response": "please fill all the required fields"
            }));
        }
    } else {
        res.status(403).send(JSON.stringify({
            "response": "the two password fields did not match"
        }));
    }

})

app.post('/api/forgot/', (req, res) => {
    auth.rest_password(conn, req, res)
});


app.post("/api/reset/", (req, res) => {
    data = req.body
    if (!data.password1 || !data.password2 || !data.token) {
        res.status(403).send(JSON.stringify({
            "response": "please supply all required fields"
        }));
    } else {
        if (data.password1 !== data.password2) {
            res.status(403).send(JSON.stringify({
                "response": "the two password fields did not match"
            }));
        } else {
            auth.setNewPassword(conn, req, res, data)
        }
    }

})

app.get("/api/get-profile/", auth.authenticateToken, (req, res) => {
    user_id = req.user
    profile.get_profile(conn, user_id, res)
})

app.listen(8000, () => {
    console.log('Server started on port 8000...');
});