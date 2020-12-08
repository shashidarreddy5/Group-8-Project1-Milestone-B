const jwt = require('jsonwebtoken');
var async = require('async');
var crypto = require('crypto');
const {secret} = require("./config.json")
const {SENDGRID_USERNAME} = require('./config.json')
const {SENDGRID_PASSWORD} = require("./config.json")
const bcrypt = require('bcrypt');
            
var nodemailer = require('nodemailer');
const error_categ = (err) => {
    return err.sqlMessage
}


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'node.mailer100@gmail.com',
      pass: 'Nodemailer@123'
    }
  });

function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}


Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        if (!user) return res.sendStatus(403);
        req.user = user.id
        next()
    })
}


const create_profile = (conn, data) => {
    let sql = `INSERT INTO \`profile\` (user_id, image, description) VALUES ("${data.user_id}", "${data.image}", "${data.description}");`
    let query = conn.query(sql, (err, results) => {
        var state = ""
        if (err) {
            err_mess = error_categ(err)
            state = [false, err_mess]
        } else {
            state = [true, results]
        }
        console.log(`[LOGS] > create profile > ${state}`)
    });
}

const login = (conn, data, res) => {
    let sql = `SELECT id,username,password,first_name,last_name, last_login FROM user WHERE username="${data.username}";`;
    conn.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length) {
            results = results[0]
            if (bcrypt.compareSync(data['password'], results['password'])) {
                const token = jwt.sign({
                    id: results.id
                }, secret, {
                    expiresIn: '7d'
                });
                results.token = token
                time = new Date().toMysqlFormat()
                res.send(JSON.stringify({
                    "status": 200,
                    "error": null,
                    "response": results
                }));
                sql = `UPDATE \`user\` SET last_login="${time}";`
                conn.query(sql, (err, results2) => {
                    if (err) throw err;
                    sql = `INSERT INTO \`login_record\` (user_id, time) VALUES ("${results.id}", "${time}");`
                    conn.query(sql, (err, results3) => {
                        if (err) throw err;
                    })
                })
            } else {
                res.status(401).send(JSON.stringify({
                    "response": "cannot login with provided credentials"
                }));
            }

        } else {
            res.status(401).send(JSON.stringify({
                "response": "A USER WITH THE NAME YOU GAVE DOES NOT EXIST"
            }));
        }

    });
}

const signup = (conn, data, res) => {
    data["password"] = bcrypt.hashSync(data.password, 10);
    console.log(data.password)
    let sql = `INSERT INTO \`user\` (username, password, first_name, last_name, created_date) VALUES ("${data.username}", "${data.password}", "${data.first_name}", "${data.last_name}", "${new Date().toMysqlFormat()}");`
    let query = conn.query(sql, (err, results) => {
        var state = ""
        if (err) {
            err_mess = error_categ(err).includes("duplicate")?"a user with the email already exist":"server error creatig user";
            state = [false, err_mess]
        } else {
            state = [true, results]
        }
        if (state[0]) {
            create_profile(conn, {
                user_id: results.insertId,
                image: null,
                description: null
            })
        }
        console.log(`[LOGS] > create user > ${state}`)
        if (!state[0]) {
            res.status(401).send(JSON.stringify({
                "status": 401,
                "error": null,
                "response": err_mess
            }));
        } else {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": state[1]
            }));
        }
    });
}

const rest_password = (conn, req, res) => 
{
    data = req.body
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },

        function(token, done) {
            let sql = `SELECT id,username,password,first_name,last_name, last_login FROM user WHERE username="${data.username}";`;
            conn.query(sql, (err, user) => {

                if (!user.length) {
                    res.status(401).send(JSON.stringify({
                        'error': 'No account with that email address exists.'
                    }));
                    return 0
                }
                user = user[0]
                sql = `UPDATE \`user\` SET reset_token="${token}"  WHERE id=${user.id};`
                conn.query(sql, (err, results2) => {
                    if (err) throw err;
                    var mailOptions = {
                        from: 'node.mailer100@gmail.com',
                        to: user.username,
                        subject: 'Sending Token',
                        text: 'Use this token to change password\n\n' 
                         + token + '\n\n' 
                        
                      };
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                    console.log(mailOptions)
                    res.send(JSON.stringify({
                        'success': 'email has been sent please check console logs for reset instructions'
                    }));
                })
            });
        },
        function(token, user, done) {
           


var mailOptions = {
  from: 'node.mailer100@gmail.com',
  to: user.email,
  subject: 'Sending Email using Node.js',
  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
  'Please click on the following link, or paste this into your browser to complete the process:\n\n' 
   + token + '\n\n' +
  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
};


            console.log(mailOptions);

           

            res.send(JSON.stringify({
                'success': 'email has been sent pleache check for reset instructions'
            }));
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
}

const setNewPassword = (conn, req, res, data) => {
    let sql = `SELECT id FROM user WHERE reset_token="${data.token}";`
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        if (!results.length) {
            res.status(401).send("could not validate the token, it has either expired or is invalid")
        } else {
            results = results[0]
            data["password1"] = bcrypt.hashSync(data.password1, 10);
            sql = `UPDATE \`user\` SET  reset_token="", password="${data.password1}" WHERE id=${results.id};`
            conn.query(sql, (err, results2) => {
                if (err) throw err;
                res.send(JSON.stringify({"success":"your password has been set, you can now login with the new password"}))
            })
        }
    })


}
module.exports = {
    login,
    signup,
    authenticateToken,
    rest_password,
    setNewPassword
}