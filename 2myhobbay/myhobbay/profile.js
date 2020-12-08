const error_categ = (err) => {
    return err.sqlMessage
}
const upload_image = (conn, res, path_, user) => {
    sql = `UPDATE \`profile\` SET image="${path_}" WHERE user_id=${user};`
    conn.query(sql, (err, results) => {
        if (err) {
            err_mess = error_categ(err)
            state = [false, err_mess]
            res.status(401).send(JSON.stringify({
                "response": err_mess
            }));
        } else {
            get_profile(conn, user, res)
        }
    })

}
const update_profile = (conn, data, res) => {
    sql = `UPDATE \`profile\` SET description="${data.description}", country="${data.country}", city="${data.city}" WHERE user_id=${data.user};`
    conn.query(sql, (err, results) => {
        if (err) {
            err_mess = error_categ(err)
            state = [false, err_mess]
            res.status(401).send(JSON.stringify({
                "response": err_mess
            }));
        } else {
            sql = `UPDATE \`user\` SET first_name="${data.first_name}", last_name="${data.last_name}" WHERE id=${data.user};`
            console.log(sql)
            conn.query(sql, (err, results) => {
                if (err) {
                    err_mess = error_categ(err)
                    state = [false, err_mess]
                    res.status(401).send(JSON.stringify({
                        "response": err_mess
                    }));
                } else {
                    get_profile(conn, data.user, res)
                }

            })
        }

    })
}
const get_profile = (conn, user_id, res) => {
    sql = `SELECT id,image, description, city, country FROM \`profile\` WHERE user_id=${user_id};`
    conn.query(sql, (err, results) => {
        results = results[0]
        if (err) {
            err_mess = error_categ(err)
            state = [false, err_mess]
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": err_mess
            }));
        } else {
            sql = `SELECT id,username,first_name,last_name, last_login FROM user WHERE id=${user_id};`;
            conn.query(sql, (err, results2) => {
                if (err) {
                    err_mess = error_categ(err)
                    state = [false, err_mess]
                    res.status(401).send(JSON.stringify({
                        "response": err_mess
                    }));
                } else {
                    results['user'] = results2[0]
                    sql = `SELECT time, id FROM  login_record  WHERE user_id=${user_id} ORDER BY  id desc limit 5;`
                    conn.query(sql, (err, results3) => {
                        if (err) {
                            err_mess = error_categ(err)
                            state = [false, err_mess]
                            res.status(401).send(JSON.stringify({
                                "response": err_mess
                            }));
                        } else {
                            results['logins'] = results3
                            state = [true, results]
                            res.send(JSON.stringify(results));
                        }
                    })
                }
            })

        }
    })
}
module.exports = {
    update_profile,
    get_profile,
    upload_image
}