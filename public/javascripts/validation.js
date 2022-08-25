function validatename() {
    var name_err = document.getElementById('username-err')
    var name = document.getElementById('username').value;

    if (name.length == 0 || name == '') {
        name_err.innerHTML = "Name cannot be empty";
        return false;
    }

    if (!name.match(/^[A-Za-z]*\s{0,1}?[A-Za-z]*\s{0,1}?[A-Za-z]*$/)) {
        name_err.innerHTML = "Write Proper name";
        return false;
    }

    if (name.length <= 3 || name.length >= 25) {
        name_err.innerHTML = "Name must be between 3 and 25 characters";
        return false;
    }

    name_err.innerHTML = ""
    return true;
}


function validateEmail() {
    var email = document.getElementById('emailid').value
    var email_err = document.getElementById('emailid-err')

    if (email.length == 0 || email == '') {
        email_err.innerHTML = 'Email cannot be empty'
        return false;
    }

    if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        email_err.innerHTML = "Enter valid Email ID";
        return false;
    }

    email_err.innerHTML = ''
    return true;
}

function validatemobile() {
    var mob = document.getElementById('mobilenumber').value
    var mob_err = document.getElementById('mobilenumber-err')

    if (mob.length !=10) {
        mob_err.innerHTML = 'Enter Proper Number'
        return false;
    }

    mob_err.innerHTML = ''
    return true;
}

function validatepassword() {
    var password = document.getElementById('password').value
    var password_err = document.getElementById('password-err')

    if (password.length == 0 || password.length <= 6) {
        password_err.innerHTML = 'Enter valid password'
        return false;
    }
    password_err.innerHTML = ''
    return true;

}

function validateForm() {
    if (!validatepassword() || !validatemobile() || !validateEmail()  || !validatename()) {
        return false;
    }
    return true;
}

function updatedata() {
    if (!validatemobile() || !validateEmail() || !validatename()) {
        return false;
    }
    return true;
}
function pwcheck(){
    if (!validatepassword()) {
        document.getElementById('pwErr').innerHTML='Enter currect data'
        return false;
    }
    return true;
}


function checkAddress() {
    var street = document.getElementById('street').value
    var streetErr = document.getElementById('streetErr')
    if (street.length <= 3 || street == '') {
        streetErr.innerHTML = 'Enter valid details'
        return false;
    }
    streetErr.innerHTML = ''
    return true;
}
function country() {
    var street = document.getElementById('country').value
    var countryErr = document.getElementById('countryErr')
    if (street.length <= 3 || street == '') {
        countryErr.innerHTML = 'Enter valid details'
        return false;
    }
    countryErr.innerHTML = ''
    return true;
}

function checkpin() {
    var street = document.getElementById('pin').value
    var pinErr = document.getElementById('pinErr')
    if (street.length <= 3 || street == '') {
        pinErr.innerHTML = 'Enter valid details'
        return false;
    }
    pinErr.innerHTML = ''
    return true;
}

 
function checkAddresstwo() {
    var street = document.getElementById('address').value
    var addressErr = document.getElementById('addressErr')
    if (street == '' || street.length <= 3) {
        addressErr.innerHTML = 'Enter valid details' 
        return false;
    }
    addressErr.innerHTML = ''
    return true;
}

// function validateForm() {
//     var radios = document.getElementsByName("payment_method");
//     var formValid = false;

//     var i = 0;
//     while (!formValid && i < radios.length) {
//         if (radios[i].checked) formValid = true;
//         i++;
//     }

//     if (!formValid) {
//         document.getElementById('err').innerHTML = "Must check one option"
//         return formValid;
//     }
// }

function validateOrderForm() {
    if (!checkAddress() || !checkAddresstwo() || !country() || !checkpin() ||  !validateEmail() ||  !validatemobile() ) {
        document.getElementById('formErr').innerHTML='Fill All data'
        return false;
    }
    return true;
} 
 
function checkprDT(){
    if(!checkpin()){
        document.getElementById('formErr').innerHTML='Fill All data'
        return false
    }
    return true;
}