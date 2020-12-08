$("#registration_form").submit(function(e) {
    e.preventDefault();
    firstname = e.target.elements.firstname.value
    lastname = e.target.elements.lastname.value
    email = e.target.elements.email.value
    password1 = e.target.elements.password1.value
    password2 = e.target.elements.password2.value

    data = {
        username: email,
        first_name: firstname,
        last_name: lastname,
        password2: password2,
        password1: password1
    }
    let url = "http://localhost:8000/api/signup/"
    var settings = {
        "url": url,
        "method": "POST",
        "timeout": 0,
        "headers": get_headers(),
        "data": JSON.stringify(data),
    };

    $.ajax(settings).done(function(response) {
        console.log(response)
        response = JSON.parse(response)
        if (response.status == 200) {
            signup_message = "you have signed in succesfully check your email for activation code"
            $("#create_success").html(signup_message)
        }
    }).catch(err => {
        console.log(err)
        $("#signup_error").html(JSON.parse(err.responseText).response)
    });;
})

$("#Login_form").submit(function(e) {
    e.preventDefault();

    email = e.target.elements.email.value
    password = e.target.elements.password.value

    data = {
        username: email,
        password: password,
    }
    let url = "http://localhost:8000/api/login/"
    var settings = {
        "url": url,
        "method": "POST",
        "timeout": 0,
        "headers": get_headers(),
        "data": JSON.stringify(data),
    };

    $.ajax(settings).done(function(response) {
        response = JSON.parse(response)
        console.log(response)
        if (response) {
            signup_message = "you have logged in succesfully"
            localStorage.setItem('token', response.response.token)
            localStorage.setItem('user', JSON.stringify(response.response))
            $("#login_succe").html(signup_message)
            window.location.pathname = "/"
        }
    }).catch(err => {
        console.log(err)
        $("#login_error").html(JSON.parse(err.responseText).response)
    });
})

$("#Reset_form").submit(function(e) {
    e.preventDefault();
    email = e.target.elements.email.value

    data = {
        username: email,
    }
    let url = "http://localhost:8000/api/forgot/"
    var settings = {
        "url": url,
        "method": "POST",
        "timeout": 0,
        "headers": get_headers(),
        "data": JSON.stringify(data),
    };

    $.ajax(settings).done(function(response) {
        response = JSON.parse(response)
        $("#reset_error").html("")
       $("#reset_succe").html(response.success)

    }).catch(err => {
        $("#reset_error").html(JSON.parse(err.responseText).error)
    });
})