jQuery(document).ready(function($) {
    const updateBody = (data) => {
        console.log(data)
        $("#P_username").html(data.user.first_name + " " + data.user.last_name)
        $("#F_username").val(data.user.username)
        $("#F_firstname").val(data.user.first_name)
        $("#F_lastname").val(data.user.last_name)
        $("#personal_details").html(data.description === "null" ? "" : data.description)
        $("#F_description").val(data.description === "null" ? "" : data.description)
        $("#F_country").val(data.country)
        $("#F_city").val(data.city)
        $("#last_login").html(new Date(data.user.last_login).toString())
        html_ = ""
        for (activity in data.logins) {
            html_ += `
				<div class="feed-item">
                  <div class="live-activity">
                    <p class="text-muted">${new Date(data.logins[activity].time).toString()}</p>
                  </div>
                </div>
                `
        }
        $("#log_activ").html(html_)
        if (data.image && data.image !== "null") {
            img = `
        	<img src="${data.image}" alt="${data.user.first_name + data.user.last_name}" class="img-responsive profile-photo" />
        	`
            $("#prof_img").html(img)
        }
    }
    let url = "http://localhost:8000/api/get-profile/"
    var settings = {
        "url": url,
        "method": "GET",
        "timeout": 0,
        "headers": get_headers(),
    };

    $.ajax(settings).done(function(response) {
        response = JSON.parse(response)
        updateBody(response)

    }).catch(err => {
        alert(JSON.parse(err.responseText).response)
    });;

    $("#userprofile").submit(function(e) {
        e.preventDefault()
        firstname = e.target.elements.firstname.value
        lastname = e.target.elements.lastname.value
        description = e.target.elements.description.value
        country = e.target.elements.country.value
        city = e.target.elements.city.value
        data = {
            description: description,
            first_name: firstname,
            last_name: lastname,
            city: city,
            country: country
        }
        let url = "http://localhost:8000/api/update-profile/"
        var settings = {
            "url": url,
            "method": "POST",
            "timeout": 0,
            "headers": get_headers(),
            "data": JSON.stringify(data),
        };

        $.ajax(settings).done(function(response) {
            response = JSON.parse(response)
            updateBody(response)
        }).catch(err => {
            console.log(err)
            $("#editprof_error").html(JSON.parse(err.responseText).response)
        });;
    })
    const handleImageUpload = file => {
        const formData = new FormData()
        formData.append('myFile', file)
        let url = "http://localhost:8000/api/upload-pic/"
        fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Barer ${localStorage.getItem('token')}`,
                }
            })
            .then(response => response.json())
            .then(data => {
                updateBody(data)
            })
            .catch(error => {
                console.error(error)
            })
    }
    $('#mediaFile').change(function(e) {

        var input = e.target;
        if (input.files && input.files[0]) {
            var file = input.files[0];
            var reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = function(e) {
                console.log(reader.result);
                img = `
	<img src="${reader.result}" alt="" class="img-responsive profile-photo" />
	`
                $("#prof_img").html(img)
                handleImageUpload(file)
            }
        }
    })

})